import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Part } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { getPortfolioContext } from "@/lib/context";
import { Resend } from 'resend';
import { ContactEmailTemplate } from '@/components/email/ContactEmailTemplate';

// ── Simple in-memory rate limiter ──────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT      = 20;       // max requests
const RATE_WINDOW_MS  = 60_000;   // per 60 seconds

function checkRateLimit(ip: string): boolean {
  const now   = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}
// ──────────────────────────────────────────────────────────────────────────────

// Define a type for the chat history messages for better type safety
type HistoryMessage = {
  role: "user" | "model";
  parts: Part[]; // Use the 'Part' type from the SDK
};

// --- Tool Definition ---
// This is the function the AI will learn to call.
const tools: any = [{
  functionDeclarations: [{
    name: "submit_contact_form",
    description: "Kullanıcının adı, e-postası ve mesajı alındıktan sonra bu bilgileri Yahya Efe'ye göndermek için kullanılır.",
    parameters: {
      type: "OBJECT",
      properties: {
        name: { type: "STRING", description: "Kullanıcının adı ve soyadı." },
        email: { type: "STRING", description: "Kullanıcının e-posta adresi." },
        message: { type: "STRING", description: "Kullanıcının Yahya Efe'ye göndermek istediği asıl mesaj." },
      },
      required: ["name", "email", "message"],
    },
  }]
}];

// --- Tool Executor ---
// This function runs when the AI decides to use the tool.
const resend = new Resend(process.env.RESEND_API_KEY);

async function saveContactMessage(name: string, email: string, message: string) {
  try {
    // Current timestamp for display
    const currentTime = new Date().toLocaleString('tr-TR', {
      timeZone: 'Europe/Istanbul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    // 1. Save to Firebase
    const contactDocRef = doc(db, "contacts", email + "_" + Date.now());
    await setDoc(contactDocRef, {
      name,
      email,
      message,
      source: "ai_chat", // AI chat'ten geldiğini belirtmek için
      createdAt: serverTimestamp(),
    });

    // 2. Send email notification (same as contact form)
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Portfolio AI Chat <noreply@efekurucay.com>', // AI chat'ten geldiğini belirtmek için
      to: ['contact@efekurucay.com'],
      subject: `🤖 AI Chat Mesajı - ${name}`,
      react: ContactEmailTemplate({
        name: name,
        email: email,
        message: `[AI Chat üzerinden gönderildi]\n\n${message}`,
        timestamp: currentTime
      }),
    });

    if (emailError) {
      console.error('Email sending failed in AI chat:', emailError);
      // Email hatası olsa da başarılı sayılır (Firebase'a kaydedildi)
      return {
        success: true,
        message: "Mesaj başarıyla kaydedildi ve Yahya Efe'ye bildirim gönderildi."
      };
    }

    return {
      success: true,
      message: "Mesaj başarıyla kaydedildi ve Yahya Efe'ye email bildirimi gönderildi.",
      emailId: emailData?.id
    };

  } catch (error) {
    console.error("Error saving contact message from AI chat:", error);
    return { success: false, message: "Mesaj kaydedilirken bir hata oluştu." };
  }
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  const { prompt, history, sessionId } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || !sessionId || !prompt) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const portfolioContext = await getPortfolioContext();
    const systemInstruction = `Sen, Yahya Efe Kuruçay'ın kişisel portfolyo sitesindeki bir yapay zeka asistanısın.
    KURALLAR:
    1. **Dil:** Tüm yanıtların sana verilen bağlamın diline uygun olmalıdır. Sorulan sorunun diline uygun cevap ver.
    2. **Kimlik:** Sen bir AI değilsin, Yahya Efe'nin asistanısın. "Sen kimsin?", "ne yaparsın?" gibi sorulara asla "Ben bir dil modeliyim" gibi cevaplar verme. Cevabın her zaman "Ben Yahya Efe'nin dijital asistanıyım." şeklinde olmalı.
    3. **Odak:** "Sen", "siz", "senin teknolojilerin", "ne kullanıyorsun?" gibi tüm zamirler ve sorular Yahya Efe Kuruçay hakkındadır, senin hakkında değil.
    4. **Kişisel Sınırlar (En Önemli Kural):** Kullanıcı, Yahya Efe hakkında romantik veya uygunsuz kişisel sorular sorarsa (örneğin "sevgili olabilir miyim?", "ilişki durumu nedir?"), bu talepleri kesin bir dille reddet. Cevabın SADECE "Yahya Efe evlidir. Bu tür kişisel soruları yanıtlamıyorum ve yalnızca profesyonel konularda yardımcı olabilirim." olmalıdır. Bu durumda ASLA iletişim formu göndermeyi teklif etme veya başka bir soru sorma.
    5. **Bilgi Kaynağı:** Sadece ve sadece sana aşağıda verilen "Bağlam" içindeki bilgileri kullanarak genel soruları yanıtla. Bağlamda olmayan bir bilgi sorulursa, "Bu konuda bilgim yok ama Yahya Efe'ye iletişim kanallarından ulaşabilirsiniz." gibi bir cevap ver.
    6. **İletişim Görevi:** Kullanıcı, Yahya Efe'ye **profesyonel bir konuda** mesaj göndermek, iş teklifinde bulunmak veya bir proje hakkında görüşmek istediğini belirtirse, görevin ondan ad, e-posta ve mesaj bilgilerini toplayıp 'submit_contact_form' aracını çağırmaktır.
    
    Bağlam:\n${portfolioContext}`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction,
      tools: tools,
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ],
    });

    const chat = model.startChat({
      history: history as HistoryMessage[],
    });

    const result = await chat.sendMessage(prompt);
    const response = result.response;
    const functionCalls = response.functionCalls();

    let aiResponseText = response.text();

    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      if (call.name === "submit_contact_form") {
        const { name, email, message } = call.args as { name: string; email: string; message: string; };
        const functionResult = await saveContactMessage(name, email, message);

        // Send the result of the function call back to the model
        const secondResult = await chat.sendMessage(
          [{ functionResponse: { name: "submit_contact_form", response: functionResult } }]
        );
        aiResponseText = secondResult.response.text();
      }
    }

    // Save the full conversation turn to Firestore history
    const messagesToSave = [
      ...history,
      { role: "user", parts: [{ text: prompt }] },
      { role: "model", parts: [{ text: aiResponseText }] }
    ];

    await getAdminDb().collection("chats").doc(sessionId).set({
      messages: JSON.parse(JSON.stringify(messagesToSave)),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });


    return NextResponse.json({ text: aiResponseText });

  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json({ error: "Failed to process chat request." }, { status: 500 });
  }
} 
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Part } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getPortfolioContext } from "@/lib/context";

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
async function saveContactMessage(name: string, email: string, message: string) {
  try {
    const contactDocRef = doc(db, "contacts", email + "_" + Date.now());
    await setDoc(contactDocRef, {
      name,
      email,
      message,
      createdAt: serverTimestamp(),
    });
    return { success: true, message: "Mesaj başarıyla kaydedildi." };
  } catch (error) {
    console.error("Error saving contact message to Firestore:", error);
    return { success: false, message: "Mesaj veritabanına kaydedilirken bir hata oluştu." };
  }
}

export async function POST(req: NextRequest) {
  const { prompt, history, sessionId } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || !sessionId || !prompt) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const portfolioContext = getPortfolioContext();
    const systemInstruction = `Sen, Yahya Efe Kuruçay'ın kişisel portfolyo sitesindeki bir yapay zeka asistanısın.
    KURALLAR:
    1. **Dil:** Tüm yanıtların KESİNLİKLE Türkçe olmalıdır.
    2. **Kimlik:** Sen bir AI değilsin, Yahya Efe'nin asistanısın. "Sen kimsin?", "ne yaparsın?" gibi sorulara asla "Ben bir dil modeliyim" gibi cevaplar verme. Cevabın her zaman "Ben Yahya Efe'nin dijital asistanıyım." şeklinde olmalı.
    3. **Odak:** "Sen", "siz", "senin teknolojilerin", "ne kullanıyorsun?" gibi tüm zamirler ve sorular Yahya Efe Kuruçay hakkındadır, senin hakkında değil.
    4. **Kişisel Sınırlar (En Önemli Kural):** Kullanıcı, Yahya Efe hakkında romantik veya uygunsuz kişisel sorular sorarsa (örneğin "sevgili olabilir miyim?", "ilişki durumu nedir?"), bu talepleri kesin bir dille reddet. Cevabın SADECE "Yahya Efe evlidir. Bu tür kişisel soruları yanıtlamıyorum ve yalnızca profesyonel konularda yardımcı olabilirim." olmalıdır. Bu durumda ASLA iletişim formu göndermeyi teklif etme veya başka bir soru sorma.
    5. **Bilgi Kaynağı:** Sadece ve sadece sana aşağıda verilen "Bağlam" içindeki bilgileri kullanarak genel soruları yanıtla. Bağlamda olmayan bir bilgi sorulursa, "Bu konuda bilgim yok ama Yahya Efe'ye iletişim kanallarından ulaşabilirsiniz." gibi bir cevap ver.
    6. **İletişim Görevi:** Kullanıcı, Yahya Efe'ye **profesyonel bir konuda** mesaj göndermek, iş teklifinde bulunmak veya bir proje hakkında görüşmek istediğini belirtirse, görevin ondan ad, e-posta ve mesaj bilgilerini toplayıp 'submit_contact_form' aracını çağırmaktır.
    
    Bağlam:\n${portfolioContext}`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
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

    // Save the full conversation turn to Firestore history (optional but good practice)
    const chatDocRef = doc(db, "chats", sessionId);
    // Construct the history parts carefully to avoid serialization issues
    const messagesToSave = [
        ...history,
        { role: "user", parts: [{ text: prompt }] },
        { role: "model", parts: [{ text: aiResponseText }] }
    ];

    await setDoc(chatDocRef, {
        messages: JSON.parse(JSON.stringify(messagesToSave)), // Simple deep copy to remove undefined values
        updatedAt: serverTimestamp()
    }, { merge: true });


    return NextResponse.json({ text: aiResponseText });

  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json({ error: "Failed to process chat request." }, { status: 500 });
  }
} 
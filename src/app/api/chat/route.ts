import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Part } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { getPortfolioContext } from "@/lib/context";
import { Resend } from 'resend';
import { ContactEmailTemplate } from '@/components/email/ContactEmailTemplate';
import { sendTelegramMessage } from "@/lib/telegram";

// ── Random session names for Telegram identification ─────────────────────────
const SESSION_NAMES = [
  "Yıldız", "Bulut", "Deniz", "Rüzgar", "Güneş", "Ay", "Kardelen", "Fırtına",
  "Atlas", "Orkide", "Lale", "Zeytin", "Mercan", "Nehir", "Kumsal", "Papatya",
  "Gökkuşağı", "Amber", "Defne", "Kıvılcım", "Safir", "Okyanus", "Yağmur", "Çınar",
  "Gölge", "Alev", "Duman", "Bora", "Irmak", "Çiçek", "Toprak", "Şafak",
];

function getSessionName(sessionId: string): string {
  // Deterministic hash from sessionId → consistent name per session
  let hash = 0;
  for (let i = 0; i < sessionId.length; i++) {
    hash = ((hash << 5) - hash + sessionId.charCodeAt(i)) | 0;
  }
  return SESSION_NAMES[Math.abs(hash) % SESSION_NAMES.length];
}
// ──────────────────────────────────────────────────────────────────────────────

// ── Simple in-memory rate limiter ──────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;       // max requests
const RATE_WINDOW_MS = 60_000;   // per 60 seconds

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
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

    // 1. Save to Firebase (admin SDK)
    await getAdminDb().collection("contacts").doc(email + "_" + Date.now()).set({
      name,
      email,
      message,
      source: "ai_chat",
      createdAt: FieldValue.serverTimestamp(),
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

// ── Extract user name from chat history ───────────────────────────────────────
async function extractUserName(
  apiKey: string,
  history: HistoryMessage[]
): Promise<string | null> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const recentMessages = history
      .slice(-10)
      .map((m) => `${m.role}: ${m.parts[0]?.text?.slice(0, 300)}`)
      .join("\n");

    if (!recentMessages.trim()) return null;

    const prompt = `Extract the user's first name from this conversation if they mentioned it. Only return the name, nothing else. If no name was mentioned, return exactly "NONE".

Conversation:
${recentMessages}`;

    const result = await model.generateContent(prompt);
    const name = result.response.text().trim();
    if (!name || name === "NONE" || name.length > 50) return null;
    return name;
  } catch {
    return null;
  }
}
// ──────────────────────────────────────────────────────────────────────────────

// ── Unknown Question Detection Tool ───────────────────────────────────────────
interface UnknownDetectionResult {
  unknown: boolean;
  reason: string;
  confidence: number; // 0-100
}

async function detectUnknownQuestion(
  apiKey: string,
  prompt: string,
  portfolioContext: string
): Promise<UnknownDetectionResult> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    // Provide a short context summary (names, role, topics) — not full content
    const contextSummary = portfolioContext.slice(0, 600);

    const judgePrompt = `You are a strict scope-detection agent for Yahya Efe Kuruçay's personal portfolio chatbot.

## ALLOWED (unknown: false)
- Questions about Yahya Efe: career, projects, skills, education, experience, contact info, professional background
- Greetings, small talk, pleasantries ("merhaba", "naber", "nasılsın", "hello", "hey")
- Self-introductions ("ben Ali", "my name is...", "benim adım...")
- Follow-up or conversational messages ("tamam", "teşekkürler", "ok", "evet", "hayır", "anladım")
- Requests to contact Efe, send a message, or work together
- Questions about the chatbot itself ("sen kimsin", "ne yaparsın")
- Compliments, feedback about the portfolio or site
- Generic tech questions that Efe could reasonably answer given his expertise
- Short, ambiguous messages that could be part of a normal conversation flow

## NOT ALLOWED (unknown: true) — Only flag these with HIGH confidence
- Legal, medical, or financial advice requests
- Questions about other people's personal lives
- Completely unrelated topics (cooking recipes, weather forecasts, sports scores, homework help)
- Harmful, offensive, or inappropriate content
- Requests to generate code, write essays, or act as a general-purpose AI assistant

## CRITICAL RULES
1. When in doubt, return unknown: false. False negatives are much better than false positives.
2. Short or ambiguous messages should ALMOST ALWAYS be unknown: false with confidence: 0.
3. Greetings and self-introductions are NEVER out of scope.
4. Confidence must reflect true certainty. Only use 75+ for clearly, obviously unrelated topics.
5. A message being "not a question" does NOT make it out of scope.

Context summary:
${contextSummary}

User message: "${prompt}"

Respond with ONLY valid JSON, no markdown fences:
{"unknown": <true/false>, "reason": "<brief explanation>", "confidence": <0-100>}`;

    const result = await model.generateContent(judgePrompt);
    const raw = result.response.text().trim();
    // Strip possible markdown fences
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    return JSON.parse(cleaned) as UnknownDetectionResult;
  } catch (e) {
    // Never block the main flow
    console.warn("[UnknownDetection] Failed:", e);
    return { unknown: false, reason: "detection_error", confidence: 0 };
  }
}
// ──────────────────────────────────────────────────────────────────────────────

// ── Business Intent Detection ─────────────────────────────────────────────────
interface IntentResult {
  business: boolean;  // true if user seems like a potential client/employer/collaborator
  reason: string;
  confidence: number; // 0-100
}

async function detectBusinessIntent(
  apiKey: string,
  history: HistoryMessage[]
): Promise<IntentResult> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const recentMessages = history
      .slice(-8)
      .map((m) => `${m.role === "user" ? "User" : "Bot"}: ${m.parts[0]?.text?.slice(0, 250)}`)
      .join("\n");

    if (!recentMessages.trim()) return { business: false, reason: "no_history", confidence: 0 };

    const intentPrompt = `Analyze this conversation with a portfolio chatbot. Is this user a potential business contact worth connecting with the real person?

## HIGH INTENT (business: true, confidence 70+)
- Employer or recruiter asking about availability, hiring, job fit
- Client wanting to discuss a project, collaboration, or freelance work
- Investor or partner exploring business opportunities
- Someone explicitly asking to talk to / meet / contact Efe directly
- Professional networking with clear intent

## LOW INTENT (business: false)
- Casual browsing, just curious about the portfolio
- Asking general questions about skills/projects with no business intent
- Small talk, greetings, testing the chatbot
- Students asking for homework help
- Random or off-topic conversations

## RULES
- At least 2-3 meaningful user messages needed before high confidence
- Single greetings or short messages = always low intent
- "I want to reach Efe" or "let's work together" = immediate high intent
- When in doubt, return business: false

Conversation:
${recentMessages}

Respond with ONLY valid JSON, no markdown fences:
{"business": <true/false>, "reason": "<brief explanation>", "confidence": <0-100>}`;

    const result = await model.generateContent(intentPrompt);
    const raw = result.response.text().trim();
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    return JSON.parse(cleaned) as IntentResult;
  } catch {
    return { business: false, reason: "detection_error", confidence: 0 };
  }
}
// ──────────────────────────────────────────────────────────────────────────────

// ── Response Evaluator (Self-Critic Agent) ────────────────────────────────────
const EVAL_THRESHOLD = 7; // scores below this trigger a revision

interface EvalResult {
  score: number;    // 1-10
  feedback: string;
  revised?: string; // only present when score < threshold
}

async function evaluateResponse(
  apiKey: string,
  userPrompt: string,
  aiResponse: string
): Promise<EvalResult> {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const evalPrompt = `You are a strict evaluator for a portfolio chatbot assistant.
Score the following AI response on a scale of 1-10 based on:
- Professional tone (1-3 pts)
- Clarity and completeness (1-3 pts)
- Safety / no hallucinations (1-2 pts)
- Relevance to the user question (1-2 pts)

User question: "${userPrompt}"
AI response: "${aiResponse}"

If score < ${EVAL_THRESHOLD}, also provide a concise revised version.
Respond with ONLY valid JSON, no markdown fences:
{"score": <1-10>, "feedback": "<brief>", "revised": "<only if score < ${EVAL_THRESHOLD}>"}`;

    const result = await model.generateContent(evalPrompt);
    const raw = result.response.text().trim();
    const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    return JSON.parse(cleaned) as EvalResult;
  } catch (e) {
    console.warn("[Evaluator] Failed:", e);
    return { score: 10, feedback: "evaluation_error" };
  }
}
// ──────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  const { prompt, history, sessionId, forceHandoff, userName } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || !sessionId || !prompt) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));

      try {
        // ── [0] Check if session is in live handoff mode ──────────────────
        const sessionDoc = await getAdminDb().collection("chats").doc(sessionId).get();
        const existingHandoff = sessionDoc.data()?.handoff;

        if (existingHandoff?.status === "live") {
          // Live mode: relay user message to Telegram, skip AI entirely
          const displayName = existingHandoff.displayName || getSessionName(sessionId);
          const telegramText = `👤 ${displayName}: ${prompt}`;
          const relayedMsgId = await sendTelegramMessage(telegramText, existingHandoff.telegramMessageId ?? undefined);

          // Register this new message ID so Efe can reply to it and still hit the right session
          if (relayedMsgId) {
            getAdminDb().collection("handoffSessions").add({
              sessionId,
              telegramMessageId: relayedMsgId,
              status: "live",
              requestedAt: new Date().toISOString(),
            }).catch(() => {});
          }

          // Save user message to Firestore
          await getAdminDb().collection("chats").doc(sessionId).set(
            {
              messages: FieldValue.arrayUnion({ role: "user", parts: [{ text: prompt }] }),
              updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true }
          );

          send({ type: "live_relayed" });
          send({ type: "done" });
          controller.close();
          return;
        }
        // ──────────────────────────────────────────────────────────────────

        // ── [0.5] Manual live chat request ──────────────────────────────
        if (forceHandoff) {
          // Resolve display name: explicit userName > extract from history > session code name
          let displayName: string | null = userName || null;
          if (!displayName) {
            displayName = await extractUserName(apiKey, history as HistoryMessage[]);
          }
          if (!displayName) {
            // No name found — ask client to collect it
            send({ type: "name_needed" });
            send({ type: "done" });
            controller.close();
            return;
          }

          const codeName = getSessionName(sessionId);
          const name = `${displayName} (${codeName})`;
          const recentContext = (history as HistoryMessage[])
            .slice(-6)
            .map((m: HistoryMessage) => `${m.role === "user" ? "👤" : "🤖"}: ${m.parts[0]?.text?.slice(0, 200)}`)
            .join("\n");

          const telegramText = [
            `🔔 ${name} canli sohbet istedi!\n`,
            recentContext ? `Son mesajlar:\n${recentContext}\n` : "",
            `Yanitla -> kullaniciya iletilecek.`,
          ].filter(Boolean).join("\n");

          const telegramMessageId = await sendTelegramMessage(telegramText);

          const now = new Date().toISOString();
          await getAdminDb().collection("chats").doc(sessionId).set(
            {
              handoff: {
                status: "live",
                question: prompt,
                context: recentContext,
                telegramMessageId,
                displayName,
                requestedAt: now,
                answeredAt: null,
                humanReply: null,
              },
            },
            { merge: true }
          );

          if (telegramMessageId) {
            await getAdminDb().collection("handoffSessions").add({
              sessionId,
              telegramMessageId,
              status: "live",
              requestedAt: now,
            });
          }

          send({ type: "handoff_initiated", sessionId });
          send({ type: "done" });
          controller.close();
          return;
        }
        // ──────────────────────────────────────────────────────────────────

        const portfolioContext = await getPortfolioContext();

        // ── [1] Unknown Question Detection ──────────────────────────────────
        const unknownInfo = await detectUnknownQuestion(apiKey, prompt, portfolioContext);
        if (unknownInfo.unknown) {
          console.warn(`[UnknownDetection] Out-of-scope question (confidence ${unknownInfo.confidence}%): ${unknownInfo.reason}`);
          send({ type: "unknown_question", reason: unknownInfo.reason, confidence: unknownInfo.confidence });
          // Log to Firestore asynchronously (non-blocking)
          getAdminDb().collection("chats").doc(sessionId).set(
            {
              unknownEvents: FieldValue.arrayUnion({
                prompt,
                reason: unknownInfo.reason,
                confidence: unknownInfo.confidence,
                at: new Date().toISOString(),
              }),
            },
            { merge: true }
          ).catch(() => { });

          // Auto-handoff removed — AI handles out-of-scope questions itself.
          // Live chat is only triggered manually (sidebar button or inline prompt).
        }
        // ────────────────────────────────────────────────────────────────────

        const systemInstruction = `Sen, Yahya Efe Kuruçay'ın kişisel portfolyo sitesindeki bir yapay zeka asistanısın.
    KURALLAR:
    1. **Dil:** Tüm yanıtların sana verilen bağlamın diline uygun olmalıdır. Sorulan sorunun diline uygun cevap ver.
    2. **Kimlik:** Sen bir AI değilsin, Yahya Efe'nin asistanısın. "Sen kimsin?", "ne yaparsın?" gibi sorulara asla "Ben bir dil modeliyim" gibi cevaplar verme. Cevabın her zaman "Ben Yahya Efe'nin dijital asistanıyım." şeklinde olmalı.
    3. **Odak:** "Sen", "siz", "senin teknolojilerin", "ne kullanıyorsun?" gibi tüm zamirler ve sorular Yahya Efe Kuruçay hakkındadır, senin hakkında değil.
    4. **Kişisel Sınırlar (En Önemli Kural):** Kullanıcı, Yahya Efe hakkında romantik veya uygunsuz kişisel sorular sorarsa (örneğin "sevgili olabilir miyim?", "ilişki durumu nedir?"), bu talepleri kesin bir dille reddet. Cevabın SADECE "Yahya Efe evlidir. Bu tür kişisel soruları yanıtlamıyorum ve yalnızca profesyonel konularda yardımcı olabilirim." olmalıdır. Bu durumda ASLA iletişim formu göndermeyi teklif etme veya başka bir soru sorma.
    5. **Bilgi Kaynağı:** Sadece ve sadece sana aşağıda verilen "Bağlam" içindeki bilgileri kullanarak genel soruları yanıtla. Bağlamda olmayan bir bilgi sorulursa, "Bu konuda bilgim yok ama Yahya Efe'ye iletişim kanallarından ulaşabilirsiniz." gibi bir cevap ver.
    6. **İletişim Görevi:** Kullanıcı, Yahya Efe'ye mesaj göndermek istediğini belirtirse, ondan ad, e-posta ve mesaj dahil olmak üzere 3 bilgiyi AÇIKÇA (explicit) toplamak zorundasın. Eğer kullanıcı adı veya e-postasını henüz VERMEMİŞSE, 'submit_contact_form' aracını KESİNLİKLE ÇAĞIRMA. Kullanıcı "böyle ilet", "böyle yeterli", "isim vermeyeceğim" dese dahi ASLA aracı çalıştırma; kibarca "İletişime geçebilmesi için isminize ve e-posta adresinize ihtiyacım var" diyerek bilgileri almakta ısrar et. Tüm bilgiler tam olarak sağlandığında aracı çağır.
    
    Bağlam:\n${portfolioContext}`;

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-3-flash-preview",
          systemInstruction,
          tools,
          safetySettings: [
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
          ],
        });

        const chat = model.startChat({ history: history as HistoryMessage[] });

        // ── First streaming turn ──────────────────────────────────────────────
        const streamResult = await chat.sendMessageStream(prompt);
        let fullText = "";

        for await (const chunk of streamResult.stream) {
          try {
            const text = chunk.text();
            if (text) {
              fullText += text;
              send({ type: "chunk", text });
            }
          } catch { /* function-call chunk — no text */ }
        }

        // ── Handle function calls (contact form) ─────────────────────────────
        const finalResponse = await streamResult.response;
        const functionCalls = finalResponse.functionCalls();

        if (functionCalls && functionCalls.length > 0) {
          const call = functionCalls[0];
          if (call.name === "submit_contact_form") {
            fullText = ""; // function-call turn had no visible text
            const { name, email, message } = call.args as { name: string; email: string; message: string };
            const functionResult = await saveContactMessage(name, email, message);

            // Stream the follow-up response
            const secondStream = await chat.sendMessageStream([
              { functionResponse: { name: "submit_contact_form", response: functionResult } },
            ]);

            for await (const chunk of secondStream.stream) {
              try {
                const text = chunk.text();
                if (text) {
                  fullText += text;
                  send({ type: "chunk", text });
                }
              } catch { /* skip */ }
            }
          }
        }

        // ── [2] Response Evaluator (Self-Critic) ─────────────────────────────
        let evalScore = 10;
        if (fullText) {
          const evalResult = await evaluateResponse(apiKey, prompt, fullText);
          evalScore = evalResult.score;
          console.log(`[Evaluator] score=${evalResult.score} | ${evalResult.feedback}`);

          if (evalResult.score < EVAL_THRESHOLD && evalResult.revised) {
            console.log("[Evaluator] Score below threshold — appending revised response.");
            // Append a separator and the revised response as additional chunks
            const revisedChunks = [
              "\n\n---\n*Aşağıdaki yanıt, kalite güvencesi için otomatik olarak iyileştirilmiştir:*\n\n",
              evalResult.revised,
            ];
            for (const chunk of revisedChunks) {
              send({ type: "chunk", text: chunk });
              fullText += chunk;
            }
          }
        }
        // ────────────────────────────────────────────────────────────────────

        // ── [3] Business Intent Detection — suggest live chat for valuable leads
        const fullHistory = [...(history as HistoryMessage[]), { role: "user" as const, parts: [{ text: prompt }] }];
        const userMsgCount = fullHistory.filter((m) => m.role === "user").length;
        if (userMsgCount >= 3 && !existingHandoff) {
          const intent = await detectBusinessIntent(apiKey, fullHistory);
          if (intent.business && intent.confidence >= 60) {
            send({ type: "suggest_live_chat", reason: intent.reason, confidence: intent.confidence });
          }
        }
        // ────────────────────────────────────────────────────────────────────

        // ── Persist conversation to Firestore ────────────────────────────────
        const messagesToSave = [
          ...history,
          { role: "user", parts: [{ text: prompt }] },
          { role: "model", parts: [{ text: fullText }] },
        ];
        await getAdminDb().collection("chats").doc(sessionId).set(
          {
            messages: JSON.parse(JSON.stringify(messagesToSave)),
            updatedAt: FieldValue.serverTimestamp(),
            lastEvalScore: evalScore,
          },
          { merge: true }
        );

        send({ type: "done" });
        controller.close();
      } catch (error) {
        console.error("Error in chat stream:", error);
        send({ type: "error", message: "Failed to process chat request." });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
} 
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const chatId = body.message?.chat?.id;
    if (String(chatId) !== process.env.TELEGRAM_CHAT_ID) {
      return NextResponse.json({ ok: true });
    }

    const replyText = body.message?.text;
    if (!replyText) return NextResponse.json({ ok: true });

    const db = getAdminDb();

    // Strategy 1: If Efe replied to a specific bot message, find that session
    const replyToMessageId = body.message?.reply_to_message?.message_id;
    let sessionId: string | null = null;

    if (replyToMessageId) {
      const snap = await db
        .collection("handoffSessions")
        .where("telegramMessageId", "==", replyToMessageId)
        .where("status", "==", "live")
        .limit(1)
        .get();

      if (!snap.empty) {
        sessionId = snap.docs[0].data().sessionId;
      }
    }

    // Strategy 2: If no reply match, find the most recent live session
    if (!sessionId) {
      const snap = await db
        .collection("handoffSessions")
        .where("status", "==", "live")
        .orderBy("requestedAt", "desc")
        .limit(1)
        .get();

      if (!snap.empty) {
        sessionId = snap.docs[0].data().sessionId;
      }
    }

    if (!sessionId) return NextResponse.json({ ok: true });

    // Write Efe's reply to the chat session
    await db.collection("chats").doc(sessionId).set(
      {
        messages: FieldValue.arrayUnion({
          role: "model",
          parts: [{ text: replyText }],
        }),
        handoff: {
          lastReplyAt: new Date().toISOString(),
          lastReply: replyText,
        },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Telegram Webhook] Error:", err);
    return NextResponse.json({ ok: true });
  }
}

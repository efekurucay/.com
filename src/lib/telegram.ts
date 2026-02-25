const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

export async function sendTelegramMessage(text: string, replyToMessageId?: number): Promise<number | null> {
  try {
    const body: Record<string, unknown> = {
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text,
    };
    if (replyToMessageId) {
      body.reply_to_message_id = replyToMessageId;
    }
    const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!data.ok) {
      console.error("[Telegram] API error:", data.description);
    }
    return data.ok ? data.result.message_id : null;
  } catch (err) {
    console.error("[Telegram] Failed to send message:", err);
    return null;
  }
}

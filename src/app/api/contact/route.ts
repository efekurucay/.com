import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // Add a new document with a generated id to the "contacts" collection
    await addDoc(collection(db, "contacts"), {
      name: name,
      email: email,
      message: message,
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Error saving contact message:", error);
    return NextResponse.json({ error: "Failed to save message." }, { status: 500 });
  }
} 
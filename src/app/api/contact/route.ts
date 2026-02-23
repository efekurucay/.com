import { NextRequest, NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { Resend } from 'resend';
import { ContactEmailTemplate } from '@/components/email/ContactEmailTemplate';

const resend = new Resend(process.env.RESEND_API_KEY);

// Simple in-memory rate limiter: 5 submissions per IP per 10 minutes
const rlMap = new Map<string, { count: number; resetAt: number }>();
function checkContactRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rlMap.get(ip);
  if (!entry || now > entry.resetAt) { rlMap.set(ip, { count: 1, resetAt: now + 600_000 }); return true; }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  if (!checkContactRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

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
    await getAdminDb().collection("contacts").add({
      name: name,
      email: email,
      message: message,
      createdAt: Timestamp.now(),
      read: false,
    });

    // 2. Send email notification
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Portfolio Contact <noreply@efekurucay.com>', // Verified domain
      to: ['contact@efekurucay.com'], // ← İstediğiniz email adresi
      subject: `📧${name}`,
      react: ContactEmailTemplate({
        name: name,
        email: email,
        message: message,
        timestamp: currentTime
      }),
    });

    if (emailError) {
      console.error('Email sending failed:', emailError);
      // Email hatası olsa da form başarılı sayılır (Firebase'a kaydedildi)
      return NextResponse.json({ 
        success: true, 
        warning: "Message saved but email notification failed"
      }, { status: 200 });
    }

    return NextResponse.json({ 
      success: true, 
      emailSent: true,
      emailId: emailData?.id
    }, { status: 200 });

  } catch (error) {
    console.error("Error in contact API:", error);
    return NextResponse.json({ error: "Failed to process contact form." }, { status: 500 });
  }
} 

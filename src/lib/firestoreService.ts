/**
 * Firestore Server Service — Server-side read functions ONLY
 * Uses firebase-admin SDK. This file must NEVER be imported in "use client" components.
 * For client-side writes, use firestoreClient.ts instead.
 */

import { getAdminDb } from "./firebaseAdmin";
import type { Firestore as AdminFirestore, Query as AdminQuery } from "firebase-admin/firestore";

// ==================== TYPES ====================

export interface PersonData {
    firstName: string;
    lastName: string;
    role: string;
    avatar: string;
    location: string;
    languages: string[];
}

export interface HomeData {
    headline: string;
    subline: string;
}

export interface AboutData {
    introTitle: string;
    introDescription: string;
    tableOfContentDisplay: boolean;
    tableOfContentSubItems: boolean;
    avatarDisplay: boolean;
    calendarDisplay: boolean;
    calendarLink: string;
    workDisplay: boolean;
    workTitle: string;
    studiesDisplay: boolean;
    studiesTitle: string;
    technicalDisplay: boolean;
    technicalTitle: string;
    organizationsDisplay: boolean;
    organizationsTitle: string;
    certificationsDisplay: boolean;
    certificationsTitle: string;
}

export interface ContactSettings {
    title: string;
    description: string;
}

export interface BlogSettings {
    label: string;
    title: string;
    description: string;
}

export interface WorkSettings {
    label: string;
    title: string;
    description: string;
}

export interface ChatSettings {
    label: string;
}

export interface SocialLink {
    id?: string;
    name: string;
    icon: string;
    link: string;
    order: number;
}

export interface Experience {
    id?: string;
    company: string;
    role: string;
    timeframe: string;
    achievements: string[];
    images: string[];
    type: "work" | "organization";
    order: number;
    visible: boolean;
}

export interface Education {
    id?: string;
    name: string;
    description: string;
    order: number;
}

export interface Skill {
    id?: string;
    title: string;
    description: string;
    images: string[];
    order: number;
}

export interface Certification {
    id?: string;
    name: string;
    role: string;
    order: number;
}

export interface Post {
    id?: string;
    title: string;
    slug: string;
    content: string;
    image: string;
    summary: string;
    publishedAt: string;
    updatedAt?: string;
    tags: string[];
    team: { name: string; role: string; avatar: string; linkedIn: string }[];
    link?: string;
    visible: boolean;
}

export interface Project {
    id?: string;
    title: string;
    slug: string;
    content: string;
    images: string[];
    image: string;
    summary: string;
    publishedAt: string;
    updatedAt?: string;
    team: { name: string; role: string; avatar: string; linkedIn: string }[];
    tags: string[];
    link?: string;
    visible: boolean;
}

export interface ContactMessage {
    id?: string;
    name: string;
    email: string;
    message: string;
    source?: string;
    createdAt: any;
    read: boolean;
}

// ==================== SERVER-SIDE READ FUNCTIONS (Admin SDK) ====================

function db(): AdminFirestore {
    return getAdminDb();
}

/** Get a single settings document */
export async function getSettings<T>(docId: string): Promise<T | null> {
    const snap = await db().collection("settings").doc(docId).get();
    return snap.exists ? (snap.data() as T) : null;
}

/** Get person settings */
export async function getPerson(): Promise<PersonData | null> {
    return getSettings<PersonData>("person");
}

/** Get home settings */
export async function getHome(): Promise<HomeData | null> {
    return getSettings<HomeData>("home");
}

/** Get about settings */
export async function getAbout(): Promise<AboutData | null> {
    return getSettings<AboutData>("about");
}

/** Get contact settings */
export async function getContactSettings(): Promise<ContactSettings | null> {
    return getSettings<ContactSettings>("contact");
}

/** Get blog settings */
export async function getBlogSettings(): Promise<BlogSettings | null> {
    return getSettings<BlogSettings>("blog");
}

/** Get work settings */
export async function getWorkSettings(): Promise<WorkSettings | null> {
    return getSettings<WorkSettings>("work");
}

/** Get chat settings */
export async function getChatSettings(): Promise<ChatSettings | null> {
    return getSettings<ChatSettings>("chat");
}

/** Get site config */
export async function getSiteConfig(): Promise<any | null> {
    return getSettings<any>("siteConfig");
}

/** Get all social links sorted by order */
export async function getSocialLinks(): Promise<SocialLink[]> {
    const snap = await db().collection("social").orderBy("order").get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as SocialLink));
}

export async function getExperiences(type?: "work" | "organization"): Promise<Experience[]> {
    let query: AdminQuery = db().collection("experiences");
    if (type) {
        query = query.where("type", "==", type);
    }
    const snap = await query.orderBy("order").get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Experience));
}

/** Get all education entries sorted by order */
export async function getEducation(): Promise<Education[]> {
    const snap = await db().collection("education").orderBy("order").get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Education));
}

/** Get all skills sorted by order */
export async function getSkills(): Promise<Skill[]> {
    const snap = await db().collection("skills").orderBy("order").get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Skill));
}

/** Get all certifications sorted by order */
export async function getCertifications(): Promise<Certification[]> {
    const snap = await db().collection("certifications").orderBy("order").get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Certification));
}

/** Get all visible blog posts sorted by publishedAt desc */
export async function getVisiblePosts(): Promise<Post[]> {
    const snap = await db()
        .collection("posts")
        .where("visible", "==", true)
        .orderBy("publishedAt", "desc")
        .get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Post));
}

/** Get all blog posts (including hidden) for admin */
export async function getAllPosts(): Promise<Post[]> {
    const snap = await db().collection("posts").orderBy("publishedAt", "desc").get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Post));
}

/** Get a single post by slug */
export async function getPostBySlug(slug: string): Promise<Post | null> {
    const snap = await db().collection("posts").where("slug", "==", slug).limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() } as Post;
}

/** Get a single post by ID */
export async function getPostById(id: string): Promise<Post | null> {
    const doc = await db().collection("posts").doc(id).get();
    return doc.exists ? ({ id: doc.id, ...doc.data() } as Post) : null;
}

/** Get all visible projects sorted by publishedAt desc */
export async function getVisibleProjects(): Promise<Project[]> {
    const snap = await db()
        .collection("projects")
        .where("visible", "==", true)
        .orderBy("publishedAt", "desc")
        .get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Project));
}

/** Get all projects (including hidden) for admin */
export async function getAllProjects(): Promise<Project[]> {
    const snap = await db().collection("projects").orderBy("publishedAt", "desc").get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Project));
}

/** Get a single project by slug */
export async function getProjectBySlug(slug: string): Promise<Project | null> {
    const snap = await db().collection("projects").where("slug", "==", slug).limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() } as Project;
}

/** Get a single project by ID */
export async function getProjectById(id: string): Promise<Project | null> {
    const doc = await db().collection("projects").doc(id).get();
    return doc.exists ? ({ id: doc.id, ...doc.data() } as Project) : null;
}

/** Get all contact messages */
export async function getContactMessages(): Promise<ContactMessage[]> {
    const snap = await db().collection("contacts").orderBy("createdAt", "desc").get();
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ContactMessage));
}

/** Get dashboard stats */
export async function getDashboardStats(): Promise<{
    postCount: number;
    projectCount: number;
    messageCount: number;
    unreadCount: number;
}> {
    const [posts, projects, totalContacts, unreadContacts] = await Promise.all([
        db().collection("posts").count().get(),
        db().collection("projects").count().get(),
        db().collection("contacts").count().get(),
        db().collection("contacts").where("read", "==", false).count().get(),
    ]);

    return {
        postCount: posts.data().count,
        projectCount: projects.data().count,
        messageCount: totalContacts.data().count,
        unreadCount: unreadContacts.data().count,
    };
}

// ── AI Chat Log types ──────────────────────────────────────────────────────────
export interface UnknownEvent {
    prompt: string;
    reason: string;
    confidence: number;
    at: string;
}

export interface HandoffData {
    status: "pending" | "answered" | "expired";
    question: string;
    context: string;
    telegramMessageId: number | null;
    requestedAt: string;
    answeredAt: string | null;
    humanReply: string | null;
}

export interface ChatLog {
    id: string;
    updatedAt: any;
    lastEvalScore?: number;
    unknownEvents?: UnknownEvent[];
    messageCount: number;
    handoff?: HandoffData | null;
}
// ──────────────────────────────────────────────────────────────────────────────

/** Get recent AI chat sessions (admin use) */
export async function getAIChatLogs(limit = 50): Promise<ChatLog[]> {
    const snap = await db()
        .collection("chats")
        .orderBy("updatedAt", "desc")
        .limit(limit)
        .get();

    return snap.docs.map((doc) => {
        const data = doc.data();
        return {
            id: doc.id,
            updatedAt: data.updatedAt,
            lastEvalScore: data.lastEvalScore ?? null,
            unknownEvents: data.unknownEvents ?? [],
            messageCount: Array.isArray(data.messages) ? data.messages.length : 0,
            handoff: data.handoff ?? null,
        } as ChatLog;
    });
}

/** Get all unknown/out-of-scope events across all sessions */
export async function getAllUnknownEvents(): Promise<(UnknownEvent & { sessionId: string })[]> {
    const snap = await db()
        .collection("chats")
        .where("unknownEvents", "!=", null)
        .orderBy("updatedAt", "desc")
        .limit(100)
        .get();

    const events: (UnknownEvent & { sessionId: string })[] = [];
    for (const doc of snap.docs) {
        const data = doc.data();
        if (Array.isArray(data.unknownEvents)) {
            for (const ev of data.unknownEvents) {
                events.push({ ...ev, sessionId: doc.id });
            }
        }
    }
    // Sort by timestamp desc
    events.sort((a, b) => (a.at > b.at ? -1 : 1));
    return events;
}

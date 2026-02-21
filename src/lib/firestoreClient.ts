/**
 * Firestore Client Service — Client-side write functions
 * Used by admin "use client" pages to write to Firestore.
 * Does NOT import firebase-admin (which would break client bundle).
 */

import { db } from "./firebase";
import {
    collection,
    doc,
    setDoc,
    addDoc,
    deleteDoc,
    updateDoc,
} from "firebase/firestore";

/** Update a settings document */
export async function updateSettings(docId: string, data: Record<string, any>): Promise<void> {
    await setDoc(doc(db, "settings", docId), data, { merge: true });
}

/** Add a new document to a collection */
export async function addDocument(collectionName: string, data: Record<string, any>): Promise<string> {
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
}

/** Update a document */
export async function updateDocument(
    collectionName: string,
    docId: string,
    data: Record<string, any>
): Promise<void> {
    await updateDoc(doc(db, collectionName, docId), data);
}

/** Delete a document */
export async function deleteDocument(collectionName: string, docId: string): Promise<void> {
    await deleteDoc(doc(db, collectionName, docId));
}

/** Set document with specific ID */
export async function setDocument(
    collectionName: string,
    docId: string,
    data: Record<string, any>,
    merge = true
): Promise<void> {
    await setDoc(doc(db, collectionName, docId), data, { merge });
}

/** Helper: Generate slug from title */
export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[çÇ]/g, "c")
        .replace(/[ğĞ]/g, "g")
        .replace(/[ıİ]/g, "i")
        .replace(/[öÖ]/g, "o")
        .replace(/[şŞ]/g, "s")
        .replace(/[üÜ]/g, "u")
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/--+/g, "-")
        .replace(/^-|-$/g, "");
}

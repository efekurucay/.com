"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addDocument, deleteDocument, generateSlug } from "@/lib/firestoreClient";
import Link from "next/link";

interface PostItem { id: string; title: string; slug: string; publishedAt: string; visible: boolean; summary: string; }

export default function AdminPostsPage() {
    const [items, setItems] = useState<PostItem[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "posts"), orderBy("publishedAt", "desc"));
        const unsub = onSnapshot(q, (snap) => {
            setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PostItem)));
            setLoaded(true);
        });
        return unsub;
    }, []);

    const handleAdd = async () => {
        const title = "New Blog Post";
        const id = await addDocument("posts", {
            title,
            slug: generateSlug(title),
            content: "# New Blog Post\n\nStart writing your post here...",
            image: "",
            summary: "",
            publishedAt: new Date().toISOString().split("T")[0],
            updatedAt: "",
            tags: [],
            team: [],
            link: "",
            visible: false,
        });
        window.location.href = `/admin/posts/${id}`;
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this post?")) await deleteDocument("posts", id);
    };

    if (!loaded) return <div style={{ color: "#888", padding: "2rem" }}>Loading...</div>;

    return (
        <div style={{ maxWidth: "800px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff", margin: 0 }}>📝 Blog Posts</h1>
                <button onClick={handleAdd} style={btnP}>+ New Post</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {items.map((item) => (
                    <div key={item.id} style={{
                        padding: "1rem 1.25rem", borderRadius: "10px", background: "#141414", border: "1px solid #262626",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span style={{ fontWeight: 600, color: "#fff", fontSize: "0.9375rem" }}>{item.title}</span>
                                {!item.visible && (
                                    <span style={{ fontSize: "0.625rem", padding: "2px 6px", borderRadius: "4px", background: "rgba(239,68,68,0.15)", color: "#ef4444", fontWeight: 600 }}>
                                        DRAFT
                                    </span>
                                )}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "2px" }}>
                                {item.publishedAt} · /{item.slug}
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <Link href={`/admin/posts/${item.id}`} style={editBtn}>✏️ Edit</Link>
                            <button onClick={() => handleDelete(item.id)} style={{ ...editBtn, color: "#ef4444", background: "rgba(239,68,68,0.1)" }}>🗑️</button>
                        </div>
                    </div>
                ))}
                {items.length === 0 && (
                    <p style={{ color: "#888", fontSize: "0.875rem", textAlign: "center", padding: "2rem" }}>No posts yet.</p>
                )}
            </div>
        </div>
    );
}

const btnP: React.CSSProperties = { padding: "0.5rem 1rem", borderRadius: "8px", border: "none", background: "#3b82f6", color: "#fff", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer" };
const editBtn: React.CSSProperties = { padding: "0.375rem 0.75rem", borderRadius: "6px", border: "none", background: "#1e293b", color: "#94a3b8", fontSize: "0.75rem", cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" };

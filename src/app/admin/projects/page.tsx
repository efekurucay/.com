"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addDocument, deleteDocument, generateSlug } from "@/lib/firestoreClient";
import Link from "next/link";

interface ProjectItem { id: string; title: string; slug: string; publishedAt: string; visible: boolean; }

export default function AdminProjectsPage() {
    const [items, setItems] = useState<ProjectItem[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "projects"), orderBy("publishedAt", "desc"));
        const unsub = onSnapshot(q, (snap) => {
            setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProjectItem)));
            setLoaded(true);
        });
        return unsub;
    }, []);

    const handleAdd = async () => {
        const title = "New Project";
        const id = await addDocument("projects", {
            title, slug: generateSlug(title),
            content: "# New Project\n\nDescribe your project here...",
            images: [], image: "", summary: "",
            publishedAt: new Date().toISOString().split("T")[0],
            updatedAt: "", team: [], tags: [], link: "", visible: false,
        });
        window.location.href = `/admin/projects/${id}`;
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this project?")) await deleteDocument("projects", id);
    };

    if (!loaded) return <div style={{ color: "#888", padding: "2rem" }}>Loading...</div>;

    return (
        <div style={{ maxWidth: "800px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff", margin: 0 }}>🚀 Projects</h1>
                <button onClick={handleAdd} style={btnP}>+ New Project</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {items.map((item) => (
                    <div key={item.id} style={{
                        padding: "1rem 1.25rem", borderRadius: "10px", background: "#141414", border: "1px solid #262626",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span style={{ fontWeight: 600, color: "#fff" }}>{item.title}</span>
                                {!item.visible && (
                                    <span style={{ fontSize: "0.625rem", padding: "2px 6px", borderRadius: "4px", background: "rgba(239,68,68,0.15)", color: "#ef4444", fontWeight: 600 }}>DRAFT</span>
                                )}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "2px" }}>{item.publishedAt} · /{item.slug}</div>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <Link href={`/admin/projects/${item.id}`} style={editBtn}>✏️ Edit</Link>
                            <button onClick={() => handleDelete(item.id)} style={{ ...editBtn, color: "#ef4444", background: "rgba(239,68,68,0.1)" }}>🗑️</button>
                        </div>
                    </div>
                ))}
                {items.length === 0 && <p style={{ color: "#888", textAlign: "center", padding: "2rem" }}>No projects yet.</p>}
            </div>
        </div>
    );
}

const btnP: React.CSSProperties = { padding: "0.5rem 1rem", borderRadius: "8px", border: "none", background: "#3b82f6", color: "#fff", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer" };
const editBtn: React.CSSProperties = { padding: "0.375rem 0.75rem", borderRadius: "6px", border: "none", background: "#1e293b", color: "#94a3b8", fontSize: "0.75rem", cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" };

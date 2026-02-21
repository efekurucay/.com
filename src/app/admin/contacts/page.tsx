"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updateDocument, deleteDocument } from "@/lib/firestoreClient";

interface ContactItem {
    id: string; name: string; email: string; message: string;
    createdAt: any; read: boolean; source?: string;
}

export default function AdminContactsPage() {
    const [items, setItems] = useState<ContactItem[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        const q = query(collection(db, "contacts"), orderBy("createdAt", "desc"));
        const unsub = onSnapshot(q, (snap) => {
            setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ContactItem)));
            setLoaded(true);
        });
        return unsub;
    }, []);

    const handleMarkRead = async (id: string) => {
        await updateDocument("contacts", id, { read: true });
    };

    const handleDelete = async (id: string) => {
        if (confirm("Delete this message?")) {
            await deleteDocument("contacts", id);
            if (selectedId === id) setSelectedId(null);
        }
    };

    const selected = items.find((i) => i.id === selectedId);

    if (!loaded) return <div style={{ color: "#888", padding: "2rem" }}>Loading...</div>;

    return (
        <div style={{ maxWidth: "900px" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff", marginBottom: "1.5rem" }}>📧 Messages</h1>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                {/* Message List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", maxHeight: "70vh", overflowY: "auto" }}>
                    {items.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => { setSelectedId(item.id); if (!item.read) handleMarkRead(item.id); }}
                            style={{
                                padding: "0.75rem 1rem", borderRadius: "8px", cursor: "pointer",
                                background: selectedId === item.id ? "#1e293b" : "#141414",
                                border: `1px solid ${item.read ? "#262626" : "rgba(59,130,246,0.4)"}`,
                                transition: "background 0.15s",
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontWeight: item.read ? 400 : 700, color: "#fff", fontSize: "0.875rem" }}>{item.name}</span>
                                {!item.read && <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#3b82f6" }} />}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#888", marginTop: "2px" }}>{item.email}</div>
                            <div style={{ fontSize: "0.75rem", color: "#666", marginTop: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {item.message}
                            </div>
                            {item.source && <span style={{ fontSize: "0.625rem", color: "#f59e0b", marginTop: "4px", display: "inline-block" }}>via {item.source}</span>}
                        </div>
                    ))}
                    {items.length === 0 && <p style={{ color: "#888", textAlign: "center", padding: "2rem" }}>No messages.</p>}
                </div>

                {/* Message Detail */}
                <div style={{
                    padding: "1.25rem", borderRadius: "12px", background: "#141414", border: "1px solid #262626",
                    minHeight: "300px",
                }}>
                    {selected ? (
                        <>
                            <div style={{ marginBottom: "1rem" }}>
                                <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "#fff", margin: 0 }}>{selected.name}</h2>
                                <a href={`mailto:${selected.email}`} style={{ fontSize: "0.8125rem", color: "#3b82f6" }}>{selected.email}</a>
                            </div>
                            <p style={{ color: "#ccc", fontSize: "0.875rem", lineHeight: "1.75", whiteSpace: "pre-wrap" }}>
                                {selected.message}
                            </p>
                            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #262626" }}>
                                <a href={`mailto:${selected.email}?subject=Re: Your message`} style={btnP}>
                                    ↩️ Reply
                                </a>
                                <button onClick={() => handleDelete(selected.id)} style={{ ...btnP, background: "#ef4444" }}>
                                    🗑️ Delete
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#666" }}>
                            Select a message to view
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const btnP: React.CSSProperties = { padding: "0.5rem 1rem", borderRadius: "8px", border: "none", background: "#3b82f6", color: "#fff", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" };

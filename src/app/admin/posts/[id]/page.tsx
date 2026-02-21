"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updateDocument, generateSlug } from "@/lib/firestoreClient";
import ReactMarkdown from "react-markdown";

export default function AdminPostEditPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [data, setData] = useState({
        title: "", slug: "", content: "", image: "", summary: "",
        publishedAt: "", tags: [] as string[], visible: true, link: "",
    });
    const [newTag, setNewTag] = useState("");
    const [saving, setSaving] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [message, setMessage] = useState("");
    const [preview, setPreview] = useState(false);

    useEffect(() => {
        (async () => {
            const snap = await getDoc(doc(db, "posts", id));
            if (snap.exists()) setData(snap.data() as any);
            setLoaded(true);
        })();
    }, [id]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateDocument("posts", id, { ...data, updatedAt: new Date().toISOString() });
            setMessage("Saved!");
        } catch { setMessage("Error!"); }
        setSaving(false);
        setTimeout(() => setMessage(""), 3000);
    };

    const addTag = () => {
        if (newTag.trim() && !data.tags.includes(newTag.trim())) {
            setData({ ...data, tags: [...data.tags, newTag.trim()] });
            setNewTag("");
        }
    };

    const removeTag = (tag: string) => {
        setData({ ...data, tags: data.tags.filter((t) => t !== tag) });
    };

    const autoSlug = () => {
        setData({ ...data, slug: generateSlug(data.title) });
    };

    if (!loaded) return <div style={{ color: "#888", padding: "2rem" }}>Loading...</div>;

    return (
        <div style={{ maxWidth: "900px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fff", margin: 0 }}>✏️ Edit Post</h1>
                <button onClick={() => router.push("/admin/posts")} style={btnS}>← Back</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                    <label style={lbl}>Title</label>
                    <input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} style={inp} />
                </div>

                <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
                    <div style={{ flex: 1 }}>
                        <label style={lbl}>Slug</label>
                        <input value={data.slug} onChange={(e) => setData({ ...data, slug: e.target.value })} style={inp} />
                    </div>
                    <button onClick={autoSlug} style={{ ...btnS, marginBottom: 0 }}>Auto</button>
                </div>

                <div>
                    <label style={lbl}>Summary</label>
                    <textarea value={data.summary} onChange={(e) => setData({ ...data, summary: e.target.value })} rows={2} style={{ ...inp, resize: "vertical" }} />
                </div>

                <div>
                    <label style={lbl}>Image URL</label>
                    <input value={data.image} onChange={(e) => setData({ ...data, image: e.target.value })} style={inp} placeholder="https://..." />
                    {data.image && (
                        <img src={data.image} alt="Preview" style={{ marginTop: "0.5rem", maxHeight: "120px", borderRadius: "8px", objectFit: "cover" }} />
                    )}
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                    <div style={{ flex: 1 }}>
                        <label style={lbl}>Published Date</label>
                        <input type="date" value={data.publishedAt} onChange={(e) => setData({ ...data, publishedAt: e.target.value })} style={inp} />
                    </div>
                    <div>
                        <label style={lbl}>Visible</label>
                        <div
                            onClick={() => setData({ ...data, visible: !data.visible })}
                            style={{
                                width: "44px", height: "24px", borderRadius: "12px", cursor: "pointer",
                                background: data.visible ? "#10b981" : "#333", position: "relative", transition: "all 0.2s",
                                marginTop: "0.25rem",
                            }}
                        >
                            <div style={{
                                width: "18px", height: "18px", borderRadius: "50%", background: "#fff",
                                position: "absolute", top: "3px", left: data.visible ? "22px" : "3px", transition: "left 0.2s",
                            }} />
                        </div>
                    </div>
                </div>

                {/* Tags */}
                <div>
                    <label style={lbl}>Tags</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginBottom: "0.5rem" }}>
                        {data.tags.map((tag) => (
                            <span key={tag} style={{ padding: "3px 8px", borderRadius: "4px", background: "#1e293b", color: "#94a3b8", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}>
                                {tag}
                                <button onClick={() => removeTag(tag)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: 0, fontSize: "0.875rem" }}>×</button>
                            </span>
                        ))}
                    </div>
                    <div style={{ display: "flex", gap: "0.375rem" }}>
                        <input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Add tag..." style={{ ...inp, flex: 1 }} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} />
                        <button onClick={addTag} style={btnS}>Add</button>
                    </div>
                </div>

                {/* Content */}
                <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <label style={lbl}>Content (Markdown)</label>
                        <button onClick={() => setPreview(!preview)} style={{ ...btnS, fontSize: "0.6875rem", padding: "0.25rem 0.5rem" }}>
                            {preview ? "Edit" : "Preview"}
                        </button>
                    </div>
                    {preview ? (
                        <div style={{
                            padding: "1rem", borderRadius: "8px", border: "1px solid #333",
                            background: "#0a0a0a", color: "#ccc", minHeight: "300px",
                            fontSize: "0.875rem", lineHeight: "1.75",
                        }}>
                            <ReactMarkdown>{data.content}</ReactMarkdown>
                        </div>
                    ) : (
                        <textarea
                            value={data.content}
                            onChange={(e) => setData({ ...data, content: e.target.value })}
                            rows={20}
                            style={{ ...inp, resize: "vertical", fontFamily: "monospace", fontSize: "0.8125rem", lineHeight: "1.6" }}
                        />
                    )}
                </div>

                <div style={{ display: "flex", gap: "1rem", alignItems: "center", paddingTop: "0.5rem", borderTop: "1px solid #262626" }}>
                    <button onClick={handleSave} disabled={saving} style={btnP}>
                        {saving ? "Saving..." : "💾 Save Post"}
                    </button>
                    {message && <span style={{ fontSize: "0.8125rem", color: message.includes("Error") ? "#ef4444" : "#10b981" }}>{message}</span>}
                </div>
            </div>
        </div>
    );
}

const lbl: React.CSSProperties = { display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#aaa", marginBottom: "0.375rem", textTransform: "uppercase", letterSpacing: "0.05em" };
const inp: React.CSSProperties = { width: "100%", padding: "0.625rem 0.75rem", borderRadius: "8px", border: "1px solid #333", background: "#0a0a0a", color: "#fff", fontSize: "0.875rem", outline: "none", boxSizing: "border-box" };
const btnP: React.CSSProperties = { padding: "0.625rem 1.5rem", borderRadius: "8px", border: "none", background: "#3b82f6", color: "#fff", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" };
const btnS: React.CSSProperties = { padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid #333", background: "transparent", color: "#aaa", fontSize: "0.8125rem", cursor: "pointer" };

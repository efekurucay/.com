"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updateDocument, generateSlug } from "@/lib/firestoreClient";
import { Column, Flex, Heading, Text, Input, Textarea, Switch, Button, TagInput, Spinner } from "@/once-ui/components";
import ReactMarkdown from "react-markdown";

export default function AdminProjectEditPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;
    const [loaded, setLoaded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [preview, setPreview] = useState(false);
    const [data, setData] = useState({
        title: "", slug: "", content: "", images: [] as string[], image: "",
        summary: "", publishedAt: "", tags: [] as string[], visible: true, link: "",
    });

    useEffect(() => {
        (async () => {
            const snap = await getDoc(doc(db, "projects", id));
            if (snap.exists()) setData(snap.data() as any);
            setLoaded(true);
        })();
    }, [id]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateDocument("projects", id, { ...data, updatedAt: new Date().toISOString() });
            setMessage("Saved!");
        } catch { setMessage("Error!"); }
        setSaving(false);
        setTimeout(() => setMessage(""), 3000);
    };

    if (!loaded) return <Flex fillWidth paddingY="128" horizontal="center"><Spinner /></Flex>;

    return (
        <Column maxWidth={40} gap="l">
            <Flex fillWidth horizontal="space-between" vertical="center">
                <Heading variant="display-strong-s">🚀 Edit Project</Heading>
                <Button variant="tertiary" size="s" label="← Back" onClick={() => router.push("/admin/projects")} />
            </Flex>

            <Column gap="m" padding="m" radius="l" border="neutral-medium" background="surface">
                <Input id="title" label="Title" value={data.title}
                    onChange={(e) => setData({ ...data, title: e.target.value, slug: generateSlug(e.target.value) })} />
                <Input id="slug" label="Slug" value={data.slug}
                    onChange={(e) => setData({ ...data, slug: e.target.value })} />
                <Flex gap="m" fillWidth>
                    <Input id="publishedAt" label="Published Date" value={data.publishedAt}
                        onChange={(e) => setData({ ...data, publishedAt: e.target.value })} />
                    <Input id="image" label="Cover Image URL" value={data.image}
                        onChange={(e) => setData({ ...data, image: e.target.value })} />
                </Flex>
                <Input id="summary" label="Summary" value={data.summary}
                    onChange={(e) => setData({ ...data, summary: e.target.value })} />
                <Input id="link" label="External Link (optional)" value={data.link}
                    onChange={(e) => setData({ ...data, link: e.target.value })} />
                <TagInput id="tags" label="Tags" value={data.tags}
                    onChange={(tags) => setData({ ...data, tags })} />
                <Switch isChecked={data.visible} onToggle={() => setData({ ...data, visible: !data.visible })}
                    label="Visible / Published" reverse />
            </Column>

            <Column gap="m">
                <Flex fillWidth horizontal="space-between" vertical="center">
                    <Text variant="heading-strong-s">Content (Markdown)</Text>
                    <Button variant="tertiary" size="s" label={preview ? "Edit" : "Preview"} onClick={() => setPreview(!preview)} />
                </Flex>
                {preview ? (
                    <Column padding="m" radius="l" border="neutral-medium" background="surface">
                        <div className="prose">
                            <ReactMarkdown>{data.content}</ReactMarkdown>
                        </div>
                    </Column>
                ) : (
                    <Textarea id="content" label="Markdown Content" value={data.content} lines={20}
                        onChange={(e) => setData({ ...data, content: e.target.value })} />
                )}
            </Column>

            <Flex gap="m" vertical="center">
                <Button variant="primary" label={saving ? "Saving..." : "Save"} onClick={handleSave} loading={saving} />
                {message && <Text variant="body-default-s" onBackground={message.includes("Error") ? "danger-weak" : "accent-weak"}>{message}</Text>}
            </Flex>
        </Column>
    );
}

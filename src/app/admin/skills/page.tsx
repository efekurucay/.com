"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addDocument, updateDocument, deleteDocument } from "@/lib/firestoreClient";
import { Column, Flex, Heading, Text, Input, Textarea, Button, IconButton, Spinner } from "@/once-ui/components";

interface SkillItem { id: string; title: string; description: string; images: string[]; order: number; }

export default function AdminSkillsPage() {
    const [items, setItems] = useState<SkillItem[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<SkillItem>>({});

    useEffect(() => {
        const q = query(collection(db, "skills"), orderBy("order"));
        const unsub = onSnapshot(q, (snap) => {
            setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as SkillItem)));
            setLoaded(true);
        });
        return unsub;
    }, []);

    const handleAdd = async () => { await addDocument("skills", { title: "", description: "", images: [], order: items.length }); };
    const startEdit = (item: SkillItem) => { setEditingId(item.id); setEditData({ ...item }); };
    const handleSave = async () => {
        if (!editingId) return;
        const { id, ...rest } = editData as any;
        await updateDocument("skills", editingId, rest);
        setEditingId(null);
    };
    const handleDelete = async (id: string) => { if (confirm("Delete?")) await deleteDocument("skills", id); };

    if (!loaded) return <Flex fillWidth paddingY="128" horizontal="center"><Spinner /></Flex>;

    return (
        <Column maxWidth={32} gap="l">
            <Flex fillWidth horizontal="space-between" vertical="center">
                <Heading variant="display-strong-s">🔧 Skills</Heading>
                <Button variant="secondary" size="s" label="+ Add" onClick={handleAdd} />
            </Flex>
            <Column gap="8">
                {items.map((item) => (
                    <Column key={item.id} padding="m" radius="l" border="neutral-medium" background="surface" gap="m">
                        {editingId === item.id ? (
                            <>
                                <Input id={`title-${item.id}`} label="Title" value={editData.title || ""}
                                    onChange={(e) => setEditData({ ...editData, title: e.target.value })} />
                                <Textarea id={`desc-${item.id}`} label="Description" value={editData.description || ""} lines={3}
                                    onChange={(e) => setEditData({ ...editData, description: e.target.value })} />
                                <Flex gap="8">
                                    <Button variant="primary" size="s" label="Save" onClick={handleSave} />
                                    <Button variant="tertiary" size="s" label="Cancel" onClick={() => setEditingId(null)} />
                                </Flex>
                            </>
                        ) : (
                            <Flex fillWidth horizontal="space-between" vertical="center">
                                <Column gap="4">
                                    <Text variant="heading-strong-s">{item.title || "(empty)"}</Text>
                                    <Text variant="body-default-s" onBackground="neutral-weak">{item.description}</Text>
                                </Column>
                                <Flex gap="4">
                                    <IconButton icon="edit" variant="secondary" size="s" onClick={() => startEdit(item)} tooltip="Edit" />
                                    <IconButton icon="close" variant="danger" size="s" onClick={() => handleDelete(item.id)} tooltip="Delete" />
                                </Flex>
                            </Flex>
                        )}
                    </Column>
                ))}
                {items.length === 0 && <Text onBackground="neutral-weak" align="center">No entries yet.</Text>}
            </Column>
        </Column>
    );
}

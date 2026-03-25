"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, doc, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addDocument, updateDocument, deleteDocument } from "@/lib/firestoreClient";
import { Column, Flex, Heading, Text, Input, Button, IconButton, Spinner } from "@/once-ui/components";

interface SocialItem { id: string; name: string; icon: string; link: string; order: number; }

export default function AdminSocialPage() {
    const [items, setItems] = useState<SocialItem[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<SocialItem>>({});

    useEffect(() => {
        const q = query(collection(db, "social"), orderBy("order"));
        const unsub = onSnapshot(q, (snap) => {
            setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as SocialItem)));
            setLoaded(true);
        });
        return unsub;
    }, []);

    const handleAdd = async () => { await addDocument("social", { name: "", icon: "", link: "", order: items.length }); };
    const startEdit = (item: SocialItem) => { setEditingId(item.id); setEditData({ ...item }); };
    const handleSave = async () => {
        if (!editingId) return;
        const { id, ...rest } = editData as any;
        await updateDocument("social", editingId, rest);
        setEditingId(null);
    };
    const handleDelete = async (id: string) => { if (confirm("Delete?")) await deleteDocument("social", id); };
    const handleMove = async (id: string, direction: "up" | "down") => {
        const index = items.findIndex((item) => item.id === id);
        if (index === -1) return;
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= items.length) return;

        const currentItem = items[index];
        const targetItem = items[targetIndex];

        await runTransaction(db, async (transaction) => {
            const currentRef = doc(db, "social", currentItem.id);
            const targetRef = doc(db, "social", targetItem.id);
            transaction.update(currentRef, { order: targetItem.order });
            transaction.update(targetRef, { order: currentItem.order });
        });

        setItems((prev) => prev.map((item) => {
            if (item.id === currentItem.id) return { ...item, order: targetItem.order };
            if (item.id === targetItem.id) return { ...item, order: currentItem.order };
            return item;
        }).sort((a, b) => a.order - b.order));
    };

    if (!loaded) return <Flex fillWidth paddingY="128" horizontal="center"><Spinner /></Flex>;

    return (
        <Column maxWidth={32} gap="l">
            <Flex fillWidth horizontal="space-between" vertical="center">
                <Heading variant="display-strong-s">🔗 Social Links</Heading>
                <Button variant="secondary" size="s" label="+ Add" onClick={handleAdd} />
            </Flex>
            <Column gap="8">
                {items.map((item, index) => (
                    <Column key={item.id} padding="m" radius="l" border="neutral-medium" background="surface" gap="m">
                        {editingId === item.id ? (
                            <>
                                <Input id={`name-${item.id}`} label="Name (e.g. GitHub)" value={editData.name || ""}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
                                <Input id={`icon-${item.id}`} label="Icon name (e.g. github)" value={editData.icon || ""}
                                    onChange={(e) => setEditData({ ...editData, icon: e.target.value })} />
                                <Input id={`link-${item.id}`} label="URL" value={editData.link || ""}
                                    onChange={(e) => setEditData({ ...editData, link: e.target.value })} />
                                <Flex gap="8">
                                    <Button variant="primary" size="s" label="Save" onClick={handleSave} />
                                    <Button variant="tertiary" size="s" label="Cancel" onClick={() => setEditingId(null)} />
                                </Flex>
                            </>
                        ) : (
                            <Flex fillWidth horizontal="space-between" vertical="center">
                                <Column gap="4">
                                    <Text variant="heading-strong-s">{item.name || "(empty)"}</Text>
                                    <Text variant="body-default-s" onBackground="neutral-weak">{item.link}</Text>
                                </Column>
                                <Flex gap="4">
                                    <IconButton
                                        icon="chevronUp"
                                        variant="secondary"
                                        size="s"
                                        onClick={() => handleMove(item.id, "up")}
                                        disabled={index === 0}
                                        tooltip="Move up"
                                    />
                                    <IconButton
                                        icon="chevronDown"
                                        variant="secondary"
                                        size="s"
                                        onClick={() => handleMove(item.id, "down")}
                                        disabled={index === items.length - 1}
                                        tooltip="Move down"
                                    />
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

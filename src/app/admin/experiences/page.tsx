"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { addDocument, updateDocument, deleteDocument } from "@/lib/firestoreClient";
import { Column, Flex, Heading, Text, Input, Textarea, Switch, Button, IconButton, Spinner, SegmentedControl } from "@/once-ui/components";

interface ExperienceItem {
    id: string; company: string; role: string; timeframe: string;
    achievements: string[]; images: string[]; type: string; order: number; visible: boolean;
}

export default function AdminExperiencesPage() {
    const [items, setItems] = useState<ExperienceItem[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [tab, setTab] = useState<"work" | "organization">("work");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<ExperienceItem>>({});

    useEffect(() => {
        const q = query(collection(db, "experiences"), orderBy("order"));
        const unsub = onSnapshot(q, (snap) => {
            setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ExperienceItem)));
            setLoaded(true);
        });
        return unsub;
    }, []);

    const filtered = items.filter((i) => i.type === tab);

    const handleAdd = async () => {
        await addDocument("experiences", {
            company: "", role: "", timeframe: "", achievements: [], images: [],
            type: tab, order: filtered.length, visible: true,
        });
    };

    const startEdit = (item: ExperienceItem) => { setEditingId(item.id); setEditData({ ...item }); };
    const handleSave = async () => {
        if (!editingId) return;
        const { id, ...rest } = editData as any;
        await updateDocument("experiences", editingId, rest);
        setEditingId(null);
    };
    const handleDelete = async (id: string) => { if (confirm("Delete?")) await deleteDocument("experiences", id); };

    if (!loaded) return <Flex fillWidth paddingY="128" horizontal="center"><Spinner /></Flex>;

    return (
        <Column maxWidth={32} gap="l">
            <Heading variant="display-strong-s">💼 Experiences</Heading>

            <Flex fillWidth horizontal="space-between" vertical="center" gap="m">
                <SegmentedControl
                    buttons={[
                        { label: "Work", value: "work", prefixIcon: "calendar" },
                        { label: "Organizations", value: "organization", prefixIcon: "grid" },
                    ]}
                    selected={tab}
                    onToggle={(val) => { setTab(val as any); setEditingId(null); }}
                />
                <Button variant="secondary" size="s" label="+ Add" onClick={handleAdd} />
            </Flex>

            <Column gap="8">
                {filtered.map((item) => (
                    <Column key={item.id} padding="m" radius="l" border="neutral-medium" background="surface" gap="m">
                        {editingId === item.id ? (
                            <>
                                <Input id={`company-${item.id}`} label="Company / Organization" value={editData.company || ""}
                                    onChange={(e) => setEditData({ ...editData, company: e.target.value })} />
                                <Input id={`role-${item.id}`} label="Role" value={editData.role || ""}
                                    onChange={(e) => setEditData({ ...editData, role: e.target.value })} />
                                <Input id={`timeframe-${item.id}`} label="Timeframe" value={editData.timeframe || ""}
                                    onChange={(e) => setEditData({ ...editData, timeframe: e.target.value })} />
                                <Textarea
                                    id={`achievements-${item.id}`}
                                    label="Achievements (one per line)"
                                    value={(editData.achievements || []).join("\n")}
                                    lines={4}
                                    onChange={(e) => setEditData({ ...editData, achievements: e.target.value.split("\n").filter(Boolean) })}
                                />
                                <Switch
                                    isChecked={editData.visible !== false}
                                    onToggle={() => setEditData({ ...editData, visible: !editData.visible })}
                                    label="Visible" reverse
                                />
                                <Flex gap="8">
                                    <Button variant="primary" size="s" label="Save" onClick={handleSave} />
                                    <Button variant="tertiary" size="s" label="Cancel" onClick={() => setEditingId(null)} />
                                </Flex>
                            </>
                        ) : (
                            <Flex fillWidth horizontal="space-between" vertical="center">
                                <Column gap="4">
                                    <Flex gap="8" vertical="center">
                                        <Text variant="heading-strong-s">{item.company || "(empty)"}</Text>
                                        {!item.visible && <Text variant="label-default-s" onBackground="neutral-weak">(hidden)</Text>}
                                    </Flex>
                                    <Text variant="body-default-s" onBackground="neutral-weak">{item.role} · {item.timeframe}</Text>
                                </Column>
                                <Flex gap="4">
                                    <IconButton icon="edit" variant="secondary" size="s" onClick={() => startEdit(item)} tooltip="Edit" />
                                    <IconButton icon="close" variant="danger" size="s" onClick={() => handleDelete(item.id)} tooltip="Delete" />
                                </Flex>
                            </Flex>
                        )}
                    </Column>
                ))}
                {filtered.length === 0 && <Text onBackground="neutral-weak" align="center">No {tab} experiences yet.</Text>}
            </Column>
        </Column>
    );
}

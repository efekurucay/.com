"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updateSettings } from "@/lib/firestoreClient";
import { Column, Flex, Heading, Text, Input, Button, TagInput, Spinner } from "@/once-ui/components";

export default function AdminPersonPage() {
    const [data, setData] = useState({
        firstName: "", lastName: "", role: "", avatar: "", location: "", languages: [] as string[],
    });
    const [saving, setSaving] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        (async () => {
            const snap = await getDoc(doc(db, "settings", "person"));
            if (snap.exists()) setData(snap.data() as any);
            setLoaded(true);
        })();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try { await updateSettings("person", data); setMessage("Saved!"); }
        catch { setMessage("Error!"); }
        setSaving(false);
        setTimeout(() => setMessage(""), 3000);
    };

    if (!loaded) return <Flex fillWidth paddingY="128" horizontal="center"><Spinner /></Flex>;

    return (
        <Column maxWidth={32} gap="l">
            <Heading variant="display-strong-s">👤 Personal Information</Heading>

            <Flex gap="m" fillWidth>
                <Input id="firstName" label="First Name" value={data.firstName}
                    onChange={(e) => setData({ ...data, firstName: e.target.value })} />
                <Input id="lastName" label="Last Name" value={data.lastName}
                    onChange={(e) => setData({ ...data, lastName: e.target.value })} />
            </Flex>

            <Input id="role" label="Role / Title" value={data.role}
                onChange={(e) => setData({ ...data, role: e.target.value })} />

            <Input id="avatar" label="Avatar URL" value={data.avatar}
                onChange={(e) => setData({ ...data, avatar: e.target.value })} />

            <Input id="location" label="Location (Timezone)" value={data.location}
                onChange={(e) => setData({ ...data, location: e.target.value })} />

            <TagInput id="languages" label="Languages" value={data.languages}
                onChange={(languages) => setData({ ...data, languages })} />

            <Flex gap="m" vertical="center">
                <Button variant="primary" label={saving ? "Saving..." : "Save"} onClick={handleSave} loading={saving} />
                {message && <Text variant="body-default-s" onBackground={message.includes("Error") ? "danger-weak" : "accent-weak"}>{message}</Text>}
            </Flex>
        </Column>
    );
}

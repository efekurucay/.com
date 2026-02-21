"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updateSettings } from "@/lib/firestoreClient";
import { Column, Flex, Heading, Text, Input, Textarea, Button, Spinner } from "@/once-ui/components";

export default function AdminHomePage() {
    const [data, setData] = useState({ headline: "", subline: "" });
    const [saving, setSaving] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        (async () => {
            const snap = await getDoc(doc(db, "settings", "home"));
            if (snap.exists()) setData(snap.data() as any);
            setLoaded(true);
        })();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try { await updateSettings("home", data); setMessage("Saved!"); }
        catch { setMessage("Error!"); }
        setSaving(false);
        setTimeout(() => setMessage(""), 3000);
    };

    if (!loaded) return <Flex fillWidth paddingY="128" horizontal="center"><Spinner /></Flex>;

    return (
        <Column maxWidth={32} gap="l">
            <Heading variant="display-strong-s">🏠 Home Page</Heading>

            <Input id="headline" label="Headline" value={data.headline}
                onChange={(e) => setData({ ...data, headline: e.target.value })} />

            <Textarea id="subline" label="Subline (supports Markdown)" value={data.subline} lines={4}
                onChange={(e) => setData({ ...data, subline: e.target.value })} />

            <Flex gap="m" vertical="center">
                <Button variant="primary" label={saving ? "Saving..." : "Save"} onClick={handleSave} loading={saving} />
                {message && <Text variant="body-default-s" onBackground={message.includes("Error") ? "danger-weak" : "accent-weak"}>{message}</Text>}
            </Flex>
        </Column>
    );
}

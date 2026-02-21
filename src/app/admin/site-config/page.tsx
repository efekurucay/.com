"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updateSettings } from "@/lib/firestoreClient";
import { Column, Flex, Heading, Text, Input, Select, Switch, Button, Spinner } from "@/once-ui/components";

const themeOptions = [
    { label: "Dark", value: "dark" },
    { label: "Light", value: "light" },
];
const neutralOptions = ["sand", "gray", "slate"].map((v) => ({ label: v, value: v }));
const colorOptions = ["blue", "indigo", "violet", "magenta", "pink", "red", "orange", "yellow", "moss", "green", "emerald", "aqua", "cyan"].map((v) => ({ label: v, value: v }));
const solidOptions = [{ label: "Color", value: "color" }, { label: "Contrast", value: "contrast" }];
const borderOptions = ["rounded", "playful", "conservative"].map((v) => ({ label: v, value: v }));
const surfaceOptions = [{ label: "Filled", value: "filled" }, { label: "Translucent", value: "translucent" }];
const transitionOptions = ["all", "micro", "macro"].map((v) => ({ label: v, value: v }));

export default function AdminSiteConfigPage() {
    const [data, setData] = useState<any>({
        theme: "dark", neutral: "gray", brand: "blue", accent: "orange",
        solid: "contrast", solidStyle: "flat", border: "playful",
        surface: "translucent", transition: "all", scaling: "normal",
        displayLocation: true, displayTime: true,
    });
    const [saving, setSaving] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        (async () => {
            const snap = await getDoc(doc(db, "settings", "siteConfig"));
            if (snap.exists()) setData({ ...data, ...snap.data() });
            setLoaded(true);
        })();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try { await updateSettings("siteConfig", data); setMessage("Saved!"); }
        catch { setMessage("Error!"); }
        setSaving(false);
        setTimeout(() => setMessage(""), 3000);
    };

    if (!loaded) return <Flex fillWidth paddingY="128" horizontal="center"><Spinner /></Flex>;

    return (
        <Column maxWidth={32} gap="l">
            <Heading variant="display-strong-s">⚙️ Site Configuration</Heading>

            <Column gap="m" padding="m" radius="l" border="neutral-medium" background="surface">
                <Text variant="heading-strong-s">Theme</Text>
                <Select id="theme" label="Theme" options={themeOptions} value={data.theme}
                    onSelect={(val) => setData({ ...data, theme: val })} />
                <Select id="neutral" label="Neutral Color" options={neutralOptions} value={data.neutral}
                    onSelect={(val) => setData({ ...data, neutral: val })} />
            </Column>

            <Column gap="m" padding="m" radius="l" border="neutral-medium" background="surface">
                <Text variant="heading-strong-s">Colors</Text>
                <Select id="brand" label="Brand Color" options={colorOptions} value={data.brand}
                    onSelect={(val) => setData({ ...data, brand: val })} />
                <Select id="accent" label="Accent Color" options={colorOptions} value={data.accent}
                    onSelect={(val) => setData({ ...data, accent: val })} />
            </Column>

            <Column gap="m" padding="m" radius="l" border="neutral-medium" background="surface">
                <Text variant="heading-strong-s">Style</Text>
                <Select id="solid" label="Solid Style" options={solidOptions} value={data.solid}
                    onSelect={(val) => setData({ ...data, solid: val })} />
                <Select id="border" label="Border Style" options={borderOptions} value={data.border}
                    onSelect={(val) => setData({ ...data, border: val })} />
                <Select id="surface" label="Surface Style" options={surfaceOptions} value={data.surface}
                    onSelect={(val) => setData({ ...data, surface: val })} />
                <Select id="transition" label="Transition" options={transitionOptions} value={data.transition}
                    onSelect={(val) => setData({ ...data, transition: val })} />
            </Column>

            <Column gap="m" padding="m" radius="l" border="neutral-medium" background="surface">
                <Text variant="heading-strong-s">Display</Text>
                <Switch isChecked={data.displayLocation} onToggle={() => setData({ ...data, displayLocation: !data.displayLocation })}
                    label="Show Location" reverse />
                <Switch isChecked={data.displayTime} onToggle={() => setData({ ...data, displayTime: !data.displayTime })}
                    label="Show Time" reverse />
            </Column>

            <Flex gap="m" vertical="center">
                <Button variant="primary" label={saving ? "Saving..." : "Save"} onClick={handleSave} loading={saving} />
                {message && <Text variant="body-default-s" onBackground={message.includes("Error") ? "danger-weak" : "accent-weak"}>{message}</Text>}
            </Flex>
        </Column>
    );
}

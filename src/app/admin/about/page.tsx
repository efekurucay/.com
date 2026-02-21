"use client";

import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updateSettings } from "@/lib/firestoreClient";
import { Column, Flex, Heading, Text, Input, Switch, Button, Spinner } from "@/once-ui/components";

export default function AdminAboutPage() {
    const [data, setData] = useState({
        introTitle: "", introDescription: "",
        tableOfContentDisplay: true, avatarDisplay: true,
        calendarDisplay: true, calendarLink: "",
        workDisplay: true, workTitle: "Work Experience",
        studiesDisplay: true, studiesTitle: "Education",
        technicalDisplay: true, technicalTitle: "Technical skills",
        organizationsDisplay: true, organizationsTitle: "Organizations",
        certificationsDisplay: true, certificationsTitle: "Certifications",
    });
    const [saving, setSaving] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        (async () => {
            const snap = await getDoc(doc(db, "settings", "about"));
            if (snap.exists()) setData({ ...data, ...snap.data() });
            setLoaded(true);
        })();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try { await updateSettings("about", data); setMessage("Saved!"); }
        catch { setMessage("Error!"); }
        setSaving(false);
        setTimeout(() => setMessage(""), 3000);
    };

    if (!loaded) return <Flex fillWidth paddingY="128" horizontal="center"><Spinner /></Flex>;

    return (
        <Column maxWidth={32} gap="l">
            <Heading variant="display-strong-s">📋 About Page Settings</Heading>

            <Column gap="m" padding="m" radius="l" border="neutral-medium" background="surface">
                <Text variant="heading-strong-s">Intro Section</Text>
                <Input id="introTitle" label="Section Title" value={data.introTitle}
                    onChange={(e) => setData({ ...data, introTitle: e.target.value })} />
                <Input id="calendarLink" label="Calendar Link (e.g. cal.com)" value={data.calendarLink}
                    onChange={(e) => setData({ ...data, calendarLink: e.target.value })} />
            </Column>

            <Column gap="m" padding="m" radius="l" border="neutral-medium" background="surface">
                <Text variant="heading-strong-s">Visibility</Text>
                <Switch isChecked={data.tableOfContentDisplay} onToggle={() => setData({ ...data, tableOfContentDisplay: !data.tableOfContentDisplay })} label="Table of Contents" reverse />
                <Switch isChecked={data.avatarDisplay} onToggle={() => setData({ ...data, avatarDisplay: !data.avatarDisplay })} label="Avatar" reverse />
                <Switch isChecked={data.calendarDisplay} onToggle={() => setData({ ...data, calendarDisplay: !data.calendarDisplay })} label="Calendar CTA" reverse />
            </Column>

            <Column gap="m" padding="m" radius="l" border="neutral-medium" background="surface">
                <Text variant="heading-strong-s">Sections</Text>
                <Flex gap="m" vertical="center" fillWidth>
                    <Switch isChecked={data.workDisplay} onToggle={() => setData({ ...data, workDisplay: !data.workDisplay })} />
                    <Input id="workTitle" label="Work Section Title" value={data.workTitle} onChange={(e) => setData({ ...data, workTitle: e.target.value })} />
                </Flex>
                <Flex gap="m" vertical="center" fillWidth>
                    <Switch isChecked={data.organizationsDisplay} onToggle={() => setData({ ...data, organizationsDisplay: !data.organizationsDisplay })} />
                    <Input id="orgTitle" label="Organizations Section Title" value={data.organizationsTitle} onChange={(e) => setData({ ...data, organizationsTitle: e.target.value })} />
                </Flex>
                <Flex gap="m" vertical="center" fillWidth>
                    <Switch isChecked={data.studiesDisplay} onToggle={() => setData({ ...data, studiesDisplay: !data.studiesDisplay })} />
                    <Input id="studiesTitle" label="Education Section Title" value={data.studiesTitle} onChange={(e) => setData({ ...data, studiesTitle: e.target.value })} />
                </Flex>
                <Flex gap="m" vertical="center" fillWidth>
                    <Switch isChecked={data.technicalDisplay} onToggle={() => setData({ ...data, technicalDisplay: !data.technicalDisplay })} />
                    <Input id="techTitle" label="Skills Section Title" value={data.technicalTitle} onChange={(e) => setData({ ...data, technicalTitle: e.target.value })} />
                </Flex>
                <Flex gap="m" vertical="center" fillWidth>
                    <Switch isChecked={data.certificationsDisplay} onToggle={() => setData({ ...data, certificationsDisplay: !data.certificationsDisplay })} />
                    <Input id="certTitle" label="Certifications Section Title" value={data.certificationsTitle} onChange={(e) => setData({ ...data, certificationsTitle: e.target.value })} />
                </Flex>
            </Column>

            <Flex gap="m" vertical="center">
                <Button variant="primary" label={saving ? "Saving..." : "Save"} onClick={handleSave} loading={saving} />
                {message && <Text variant="body-default-s" onBackground={message.includes("Error") ? "danger-weak" : "accent-weak"}>{message}</Text>}
            </Flex>
        </Column>
    );
}

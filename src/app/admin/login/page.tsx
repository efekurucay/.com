"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Column, Flex, Heading, Text, Input, Button, Icon, PasswordInput } from "@/once-ui/components";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/admin");
        } catch (err: any) {
            setError("Invalid email or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Flex fill center background="page">
            <Column
                maxWidth={24}
                fillWidth
                padding="xl"
                radius="xl"
                border="neutral-medium"
                background="surface"
                gap="l"
            >
                <Column horizontal="center" gap="4">
                    <Icon name="lock" size="l" onBackground="brand-weak" />
                    <Heading variant="heading-strong-l" align="center">
                        Admin Panel
                    </Heading>
                    <Text variant="body-default-s" onBackground="neutral-weak" align="center">
                        Sign in to manage your site
                    </Text>
                </Column>

                <form onSubmit={handleSubmit}>
                    <Column gap="m">
                        <Input
                            id="email"
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <PasswordInput
                            id="password"
                            label="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        {error && (
                            <Text variant="body-default-s" onBackground="danger-weak">
                                {error}
                            </Text>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            size="l"
                            fillWidth
                            label={loading ? "Signing in..." : "Sign In"}
                            loading={loading}
                        />
                    </Column>
                </form>
            </Column>
        </Flex>
    );
}

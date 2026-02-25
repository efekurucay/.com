"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Column, Flex, Text, Icon, IconButton } from "@/once-ui/components";

const menuItems = [
    { label: "Dashboard", icon: "grid", href: "/admin" },
    { label: "Person", icon: "person", href: "/admin/person" },
    { label: "Home Page", icon: "home", href: "/admin/home" },
    { label: "About", icon: "infoCircle", href: "/admin/about" },
    { label: "Social Links", icon: "link", href: "/admin/social" },
    { label: "Experiences", icon: "calendar", href: "/admin/experiences" },
    { label: "Education", icon: "book", href: "/admin/education" },
    { label: "Skills", icon: "code", href: "/admin/skills" },
    { label: "Certifications", icon: "check", href: "/admin/certifications" },
    { label: "Blog Posts", icon: "edit", href: "/admin/posts" },
    { label: "Projects", icon: "openLink", href: "/admin/projects" },
    { label: "Messages", icon: "email", href: "/admin/contacts" },
    { label: "AI Logs", icon: "chartBar", href: "/admin/ai-logs" },
    { label: "Site Config", icon: "settings", href: "/admin/site-config" },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleSignOut = async () => {
        await signOut(auth);
        router.push("/admin/login");
    };

    return (
        <Column
            position="fixed"
            style={{ top: 0, left: 0, width: "240px", height: "100vh", zIndex: 10 }}
            padding="12"
            gap="4"
            background="surface"
            border="neutral-medium"
        >
            {/* Header */}
            <Flex
                paddingX="12"
                paddingY="16"
                gap="8"
                vertical="center"
                marginBottom="8"
            >
                <Icon name="settings" size="s" onBackground="brand-strong" />
                <Text variant="heading-strong-s">CMS</Text>
            </Flex>

            {/* Navigation */}
            <Column gap="2" flex={1} style={{ overflowY: "auto" }}>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== "/admin" && pathname?.startsWith(item.href));

                    return (
                        <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                            <Flex
                                paddingX="12"
                                paddingY="8"
                                gap="12"
                                vertical="center"
                                radius="m"
                                background={isActive ? "brand-alpha-weak" : undefined}
                                className={isActive ? "" : "cursor-interactive"}
                                style={{
                                    transition: "background 0.15s",
                                }}
                            >
                                <Icon
                                    name={item.icon}
                                    size="xs"
                                    onBackground={isActive ? "brand-strong" : "neutral-weak"}
                                />
                                <Text
                                    variant="body-default-s"
                                    onBackground={isActive ? "brand-strong" : "neutral-medium"}
                                >
                                    {item.label}
                                </Text>
                            </Flex>
                        </Link>
                    );
                })}
            </Column>

            {/* Footer */}
            <Column gap="4" paddingTop="8" style={{ borderTop: "1px solid var(--neutral-border-medium)" }}>
                <Link href="/" style={{ textDecoration: "none" }}>
                    <Flex paddingX="12" paddingY="8" gap="12" vertical="center" radius="m">
                        <Icon name="openLink" size="xs" onBackground="neutral-weak" />
                        <Text variant="body-default-s" onBackground="neutral-weak">View Site</Text>
                    </Flex>
                </Link>
                <Flex
                    paddingX="12"
                    paddingY="8"
                    gap="12"
                    vertical="center"
                    radius="m"
                    onClick={handleSignOut}
                    className="cursor-interactive"
                    style={{ transition: "background 0.15s" }}
                >
                    <Icon name="close" size="xs" onBackground="danger-weak" />
                    <Text variant="body-default-s" onBackground="danger-weak">Sign Out</Text>
                </Flex>
            </Column>
        </Column>
    );
}

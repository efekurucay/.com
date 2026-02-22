"use client";

import { usePathname } from "next/navigation";

interface SiteShellProps {
    children: React.ReactNode;
    siteContent: React.ReactNode;
}

/**
 * Conditionally renders site shell (Header, Background, Footer) for non-admin routes.
 * Admin routes get just the raw children without the site wrapper.
 */
export default function SiteShell({ children, siteContent }: SiteShellProps) {
    const pathname = usePathname();
    const isAdmin = pathname === "/admin" || pathname?.startsWith("/admin/");

    if (isAdmin) {
        return <>{children}</>;
    }

    return <>{siteContent}</>;
}

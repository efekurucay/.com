"use client";

import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Login page should NOT be wrapped with AuthGuard or Sidebar
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    return (
        <AdminAuthGuard>
            <div style={{ display: "flex", minHeight: "100vh", background: "var(--page-background, #0a0a0a)" }}>
                <AdminSidebar />
                <main style={{
                    flex: 1,
                    marginLeft: "240px",
                    padding: "2rem",
                    maxWidth: "calc(100vw - 240px)",
                    overflowX: "hidden",
                }}>
                    {children}
                </main>
            </div>
        </AdminAuthGuard>
    );
}

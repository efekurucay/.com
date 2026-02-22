import { getDashboardStats, getContactMessages, getAllPosts } from "@/lib/firestoreService";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
    let stats = { postCount: 0, projectCount: 0, messageCount: 0, unreadCount: 0 };
    let recentMessages: any[] = [];
    let recentPosts: any[] = [];

    try {
        stats = await getDashboardStats();
        const messages = await getContactMessages();
        recentMessages = messages.slice(0, 5);
        const posts = await getAllPosts();
        recentPosts = posts.slice(0, 5);
    } catch (e) {
        console.error("Dashboard data fetch error:", e);
    }

    return (
        <div>
            <h1 style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                color: "var(--neutral-on-background-strong, #fff)",
                marginBottom: "2rem",
            }}>
                📊 Dashboard
            </h1>

            {/* Stats Cards */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "1rem",
                marginBottom: "2rem",
            }}>
                {[
                    { label: "Blog Posts", value: stats.postCount, icon: "📝", color: "#3b82f6" },
                    { label: "Projects", value: stats.projectCount, icon: "🚀", color: "#10b981" },
                    { label: "Messages", value: stats.messageCount, icon: "📧", color: "#f59e0b" },
                    { label: "Unread", value: stats.unreadCount, icon: "🔔", color: "#ef4444" },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        style={{
                            padding: "1.25rem",
                            borderRadius: "12px",
                            background: "var(--surface-background, #141414)",
                            border: "1px solid var(--neutral-border-medium, #262626)",
                        }}
                    >
                        <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{stat.icon}</div>
                        <div style={{
                            fontSize: "2rem",
                            fontWeight: 700,
                            color: stat.color,
                            lineHeight: 1,
                        }}>
                            {stat.value}
                        </div>
                        <div style={{
                            fontSize: "0.75rem",
                            color: "var(--neutral-on-background-weak, #888)",
                            marginTop: "0.375rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                        }}>
                            {stat.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Two-column layout */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.5rem",
            }}>
                {/* Recent Messages */}
                <div style={{
                    padding: "1.25rem",
                    borderRadius: "12px",
                    background: "var(--surface-background, #141414)",
                    border: "1px solid var(--neutral-border-medium, #262626)",
                }}>
                    <h2 style={{
                        fontSize: "1rem",
                        fontWeight: 600,
                        color: "var(--neutral-on-background-strong, #fff)",
                        marginBottom: "1rem",
                    }}>
                        📧 Recent Messages
                    </h2>
                    {recentMessages.length === 0 ? (
                        <p style={{ color: "var(--neutral-on-background-weak, #888)", fontSize: "0.875rem" }}>
                            No messages yet.
                        </p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {recentMessages.map((msg: any) => (
                                <div key={msg.id} style={{
                                    padding: "0.75rem",
                                    borderRadius: "8px",
                                    background: "var(--page-background, #0a0a0a)",
                                    border: msg.read ? "1px solid transparent" : "1px solid rgba(59,130,246,0.3)",
                                }}>
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: "0.25rem",
                                    }}>
                                        <span style={{ fontWeight: 600, fontSize: "0.8125rem", color: "var(--neutral-on-background-strong, #fff)" }}>
                                            {msg.name}
                                        </span>
                                        {!msg.read && (
                                            <span style={{
                                                fontSize: "0.625rem",
                                                padding: "2px 6px",
                                                borderRadius: "4px",
                                                background: "rgba(59,130,246,0.15)",
                                                color: "#3b82f6",
                                                fontWeight: 600,
                                            }}>
                                                NEW
                                            </span>
                                        )}
                                    </div>
                                    <p style={{
                                        fontSize: "0.75rem",
                                        color: "var(--neutral-on-background-weak, #888)",
                                        margin: 0,
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                    }}>
                                        {msg.message}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Blog Posts */}
                <div style={{
                    padding: "1.25rem",
                    borderRadius: "12px",
                    background: "var(--surface-background, #141414)",
                    border: "1px solid var(--neutral-border-medium, #262626)",
                }}>
                    <h2 style={{
                        fontSize: "1rem",
                        fontWeight: 600,
                        color: "var(--neutral-on-background-strong, #fff)",
                        marginBottom: "1rem",
                    }}>
                        📝 Recent Blog Posts
                    </h2>
                    {recentPosts.length === 0 ? (
                        <p style={{ color: "var(--neutral-on-background-weak, #888)", fontSize: "0.875rem" }}>
                            No posts yet. Run the seed endpoint first.
                        </p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {recentPosts.map((post: any) => (
                                <div key={post.id} style={{
                                    padding: "0.75rem",
                                    borderRadius: "8px",
                                    background: "var(--page-background, #0a0a0a)",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}>
                                    <span style={{ fontWeight: 500, fontSize: "0.8125rem", color: "var(--neutral-on-background-strong, #fff)" }}>
                                        {post.title}
                                    </span>
                                    <span style={{ fontSize: "0.6875rem", color: "var(--neutral-on-background-weak, #888)" }}>
                                        {post.publishedAt}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

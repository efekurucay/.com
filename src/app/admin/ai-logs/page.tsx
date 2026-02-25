import { getAIChatLogs, getAllUnknownEvents } from "@/lib/firestoreService";
import type { ChatLog, UnknownEvent } from "@/lib/firestoreService";

export const dynamic = "force-dynamic";

function ScoreBadge({ score }: { score: number | null | undefined }) {
    if (score == null) return <span style={{ color: "#888", fontSize: "0.75rem" }}>—</span>;
    const color = score >= 8 ? "#10b981" : score >= 7 ? "#f59e0b" : "#ef4444";
    return (
        <span style={{
            display: "inline-block",
            padding: "2px 8px",
            borderRadius: "999px",
            background: `${color}20`,
            color,
            fontWeight: 700,
            fontSize: "0.75rem",
            minWidth: "2rem",
            textAlign: "center",
        }}>
            {score}/10
        </span>
    );
}

function card(children: React.ReactNode, extra?: React.CSSProperties) {
    return (
        <div style={{
            padding: "1.25rem",
            borderRadius: "12px",
            background: "var(--surface-background, #141414)",
            border: "1px solid var(--neutral-border-medium, #262626)",
            ...extra,
        }}>
            {children}
        </div>
    );
}

function sectionTitle(icon: string, label: string) {
    return (
        <h2 style={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "var(--neutral-on-background-strong, #fff)",
            marginBottom: "1rem",
            marginTop: 0,
        }}>
            {icon} {label}
        </h2>
    );
}

export default async function AILogsPage() {
    let chatLogs: ChatLog[] = [];
    let unknownEvents: (UnknownEvent & { sessionId: string })[] = [];
    let avgScore: number | null = null;
    let belowThresholdCount = 0;

    try {
        [chatLogs, unknownEvents] = await Promise.all([
            getAIChatLogs(50),
            getAllUnknownEvents(),
        ]);

        const scored = chatLogs.filter((l) => l.lastEvalScore != null);
        if (scored.length > 0) {
            avgScore = Math.round(
                scored.reduce((s, l) => s + (l.lastEvalScore ?? 0), 0) / scored.length * 10
            ) / 10;
            belowThresholdCount = scored.filter((l) => (l.lastEvalScore ?? 10) < 7).length;
        }
    } catch (e) {
        console.error("AI Logs fetch error:", e);
    }

    const weak = "#888";

    return (
        <div>
            <h1 style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                color: "var(--neutral-on-background-strong, #fff)",
                marginBottom: "2rem",
                marginTop: 0,
            }}>
                🤖 AI Chat Logs
            </h1>

            {/* Summary stat cards */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: "1rem",
                marginBottom: "2rem",
            }}>
                {[
                    { label: "Total Sessions", value: chatLogs.length, icon: "💬", color: "#3b82f6" },
                    { label: "Avg Eval Score", value: avgScore != null ? `${avgScore}/10` : "—", icon: "⭐", color: "#f59e0b" },
                    { label: "Low-Score Responses", value: belowThresholdCount, icon: "⚠️", color: "#ef4444" },
                    { label: "Unknown Questions", value: unknownEvents.length, icon: "🔍", color: "#8b5cf6" },
                ].map((s) => (
                    <div key={s.label} style={{
                        padding: "1.25rem",
                        borderRadius: "12px",
                        background: "var(--surface-background, #141414)",
                        border: "1px solid var(--neutral-border-medium, #262626)",
                    }}>
                        <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{s.icon}</div>
                        <div style={{ fontSize: "2rem", fontWeight: 700, color: s.color, lineHeight: 1 }}>
                            {s.value}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: weak, marginTop: "0.375rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {s.label}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>

                {/* Chat Sessions */}
                {card(
                    <>
                        {sectionTitle("💬", "Recent Chat Sessions")}
                        {chatLogs.length === 0 ? (
                            <p style={{ color: weak, fontSize: "0.875rem", margin: 0 }}>No chat sessions yet.</p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "480px", overflowY: "auto" }}>
                                {chatLogs.map((log) => (
                                    <div key={log.id} style={{
                                        padding: "0.75rem",
                                        borderRadius: "8px",
                                        background: "var(--page-background, #0a0a0a)",
                                        display: "flex",
                                        gap: "0.75rem",
                                        alignItems: "flex-start",
                                    }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.25rem", flexWrap: "wrap" }}>
                                                <ScoreBadge score={log.lastEvalScore} />
                                                {(log.unknownEvents?.length ?? 0) > 0 && (
                                                    <span style={{ fontSize: "0.6875rem", padding: "2px 6px", borderRadius: "4px", background: "rgba(139,92,246,0.15)", color: "#8b5cf6", fontWeight: 600 }}>
                                                        {log.unknownEvents!.length} unknown
                                                    </span>
                                                )}
                                                <span style={{ fontSize: "0.6875rem", color: weak }}>{log.messageCount} msgs</span>
                                            </div>
                                            <div style={{ fontSize: "0.6875rem", color: weak, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {log.id}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Unknown / Out-of-scope Events */}
                {card(
                    <>
                        {sectionTitle("🔍", "Out-of-Scope Questions")}
                        {unknownEvents.length === 0 ? (
                            <p style={{ color: weak, fontSize: "0.875rem", margin: 0 }}>No out-of-scope questions detected.</p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "480px", overflowY: "auto" }}>
                                {unknownEvents.map((ev, i) => (
                                    <div key={i} style={{
                                        padding: "0.75rem",
                                        borderRadius: "8px",
                                        background: "var(--page-background, #0a0a0a)",
                                        borderLeft: "3px solid rgba(139,92,246,0.5)",
                                    }}>
                                        <p style={{ margin: "0 0 0.375rem", fontWeight: 500, fontSize: "0.8125rem", color: "var(--neutral-on-background-strong, #fff)" }}>
                                            "{ev.prompt}"
                                        </p>
                                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                                            <span style={{ fontSize: "0.6875rem", color: weak }}>{ev.reason}</span>
                                            <span style={{
                                                fontSize: "0.6875rem",
                                                padding: "1px 6px",
                                                borderRadius: "4px",
                                                background: "rgba(139,92,246,0.12)",
                                                color: "#8b5cf6",
                                            }}>
                                                {ev.confidence}% confidence
                                            </span>
                                            <span style={{ fontSize: "0.6875rem", color: weak, marginLeft: "auto" }}>
                                                {new Date(ev.at).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul", dateStyle: "short", timeStyle: "short" })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

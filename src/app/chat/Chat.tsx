"use client";

import React, { useState, useEffect, useRef, Suspense, useCallback } from "react";
import { useSearchParams } from 'next/navigation';
import { Avatar, Spinner, Flex, Text, Heading } from "@/once-ui/components";
import { ChatMessageContent } from "@/components/chat/ChatMessageContent";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import styles from './chat.module.scss';

type DisplayMessage = {
  text: string;
  sender: "user" | "ai";
};

type HistoryMessage = {
  role: "user" | "model";
  parts: { text: string }[];
};

const suggestions = [
  "Tell me about your projects",
  "What technologies do you use?",
  "What are your strongest skills?",
  "How can I contact you?",
];

const contactActions: { label: string; icon: React.ReactNode }[] = [
  {
    label: "I want to reach Efe",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.37 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.49 5.49l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z" />
      </svg>
    ),
  },
  {
    label: "I have a message for Efe",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    label: "Let's work together",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "What's Efe's email?",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
];

function ChatInner({ avatarUrl }: { avatarUrl: string }) {
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState("");
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([]);
  const [history, setHistory] = useState<HistoryMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);   // waiting for first chunk
  const [isStreaming, setIsStreaming] = useState(false); // typing animation running
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryHandledRef = useRef(false);
  const streamBufferRef = useRef("");
  const isApiDoneRef = useRef(false);
  const fullTextRef = useRef("");
  const typingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup interval on unmount
  useEffect(() => () => {
    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
  }, []);

  useEffect(() => {
    setSessionId(Date.now().toString() + Math.random().toString(36).substring(2));
  }, []);

  useEffect(() => {
    if (!searchParams || !sessionId || queryHandledRef.current) return;
    const starterQuery = searchParams.get('q');
    if (starterQuery) {
      handleSendMessage(starterQuery);
      queryHandledRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: isStreaming ? "instant" : "smooth" });
  }, [displayMessages, isLoading, isStreaming]);

  useEffect(() => {
    if (!isLoading && !isStreaming && textareaRef.current) textareaRef.current.focus();
  }, [isLoading, isStreaming]);

  const autoResize = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  };

  const handleSendMessage = useCallback(async (promptOverride?: string) => {
    const prompt = promptOverride || input;
    if (!prompt.trim() || isLoading || isStreaming || !sessionId) return;

    const currentInput = prompt;
    const currentHistory = history;

    // Reset animation state
    streamBufferRef.current = "";
    isApiDoneRef.current = false;
    fullTextRef.current = "";
    if (typingIntervalRef.current) { clearInterval(typingIntervalRef.current); typingIntervalRef.current = null; }

    setDisplayMessages(prev => [...prev, { text: currentInput, sender: "user" }]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: currentInput, history: currentHistory, sessionId }),
      });

      if (!response.ok || !response.body) throw new Error("Bad response");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let sseBuffer = "";
      let messageAdded = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        sseBuffer += decoder.decode(value, { stream: true });
        const lines = sseBuffer.split("\n\n");
        sseBuffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          let parsed: { type: string; text?: string };
          try { parsed = JSON.parse(line.slice(6)); } catch { continue; }

          if (parsed.type === "chunk" && parsed.text) {
            fullTextRef.current += parsed.text;
            streamBufferRef.current += parsed.text;

            if (!messageAdded) {
              messageAdded = true;
              setIsLoading(false);
              setIsStreaming(true);
              setDisplayMessages(prev => [...prev, { text: "", sender: "ai" }]);

              // Start character-by-character drip
              typingIntervalRef.current = setInterval(() => {
                if (streamBufferRef.current.length > 0) {
                  // Adaptive speed: catch up if buffer is piling up
                  const bufLen = streamBufferRef.current.length;
                  const take = bufLen > 120 ? 5 : bufLen > 40 ? 2 : 1;
                  const chars = streamBufferRef.current.slice(0, take);
                  streamBufferRef.current = streamBufferRef.current.slice(take);
                  setDisplayMessages(prev => {
                    const msgs = [...prev];
                    const last = msgs[msgs.length - 1];
                    if (last?.sender === "ai") msgs[msgs.length - 1] = { ...last, text: last.text + chars };
                    return msgs;
                  });
                } else if (isApiDoneRef.current) {
                  clearInterval(typingIntervalRef.current!);
                  typingIntervalRef.current = null;
                  setIsStreaming(false);
                  setHistory(prev => [
                    ...prev,
                    { role: "user",  parts: [{ text: currentInput }] },
                    { role: "model", parts: [{ text: fullTextRef.current }] },
                  ]);
                }
              }, 12);
            }
          } else if (parsed.type === "done") {
            isApiDoneRef.current = true;
          } else if (parsed.type === "error" && !messageAdded) {
            setIsLoading(false);
            setDisplayMessages(prev => [...prev, { text: "Sorry, an error occurred. Please try again.", sender: "ai" }]);
          }
        }
      }

      if (!messageAdded) {
        setIsLoading(false);
        setDisplayMessages(prev => [...prev, { text: "No response received.", sender: "ai" }]);
      }
    } catch {
      setIsLoading(false);
      setIsStreaming(false);
      if (typingIntervalRef.current) { clearInterval(typingIntervalRef.current); typingIntervalRef.current = null; }
      setDisplayMessages(prev => [...prev, { text: "Sorry, an error occurred. Please try again.", sender: "ai" }]);
    }
  }, [input, isLoading, isStreaming, sessionId, history]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isEmpty = displayMessages.length === 0 && !isLoading;
  const isDisabled = isLoading || isStreaming;

  return (
    <div className={styles.outerWrapper}>
    <div className={styles.chatWrapper}>
      <div className={styles.messagesArea}>
        {isEmpty ? (
          <div className={styles.welcome}>
            <Avatar size="xl" src={avatarUrl} />
            <div>
              <Heading variant="heading-strong-l">How can I help you?</Heading>
              <Text variant="body-default-m" onBackground="neutral-weak">
                Ask me anything about Efe — his projects, skills, or background.
              </Text>
            </div>
            <div className={styles.suggestionGrid}>
              {suggestions.map((s) => (
                <button key={s} className={styles.suggestionChip} onClick={() => handleSendMessage(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {displayMessages.map((msg, i) => (
              <div
                key={i}
                className={`${styles.messageRow} ${msg.sender === "user" ? styles.messageRowUser : ""}`}
              >
                <div className={styles.avatarSmall}>
                  <Avatar size="s" src={msg.sender === "ai" ? avatarUrl : undefined} />
                </div>
                <div className={`${styles.bubble} ${msg.sender === "ai" ? styles.bubbleAi : styles.bubbleUser}`}>
                  <ChatMessageContent content={msg.text} />
                </div>
              </div>
            ))}
            {isLoading && (
              <div className={styles.messageRow}>
                <div className={styles.avatarSmall}><Avatar size="s" src={avatarUrl} /></div>
                <div className={`${styles.bubble} ${styles.bubbleAi}`}>
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className={styles.inputArea}>
        <form
          className={styles.inputForm}
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
        >
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            placeholder="Message Efe's AI..."
            value={input}
            rows={1}
            onChange={(e) => { setInput(e.target.value); autoResize(); }}
            onKeyDown={handleKeyDown}
            disabled={isDisabled}
          />
          <button
            type="submit"
            className={styles.sendBtn}
            disabled={isDisabled || !input.trim()}
            aria-label="Send"
          >
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4l8 8-8 8V4z" transform="rotate(-90 12 12)" />
            </svg>
          </button>
        </form>
        <Flex horizontal="center" paddingTop="8">
          <Text variant="body-default-xs" onBackground="neutral-weak">
            AI may make mistakes. Double-check important info.
          </Text>
        </Flex>

        {/* Mobile contact shortcuts */}
        <div className={styles.mobileContactRow}>
          {contactActions.map((action) => (
            <button
              key={action.label}
              className={styles.mobileContactBtn}
              onClick={() => handleSendMessage(action.label)}
              disabled={isDisabled}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>

      {/* Desktop contact sidebar */}
      <aside className={styles.contactPanel}>
        <p className={styles.contactPanelTitle}>Quick contact</p>
        {contactActions.map((action, i) => (
          <React.Fragment key={action.label}>
            {i === 2 && <div className={styles.contactPanelDivider} />}
            <button
              className={styles.contactActionBtn}
              onClick={() => handleSendMessage(action.label)}
              disabled={isDisabled}
            >
              {action.icon}
              {action.label}
            </button>
          </React.Fragment>
        ))}
      </aside>
    </div>
  );
}

export function Chat({ avatarUrl }: { avatarUrl: string }) {
  return (
    <Suspense fallback={<Flex fillWidth paddingY="128" horizontal="center"><Spinner /></Flex>}>
      <ChatInner avatarUrl={avatarUrl} />
    </Suspense>
  );
}

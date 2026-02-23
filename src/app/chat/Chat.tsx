"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import { Column, Flex, Input, Button, Avatar } from "@/once-ui/components";
import { ChatMessageContent } from "@/components/chat/ChatMessageContent";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { Icon } from "@/once-ui/components";
import styles from './chat.module.scss';

type DisplayMessage = {
  text: string;
  sender: "user" | "ai";
};

type HistoryMessage = {
  role: "user" | "model";
  parts: { text: string }[];
};

function ChatInner({ avatarUrl }: { avatarUrl: string }) {
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState("");
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([]);
  const [history, setHistory] = useState<HistoryMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const queryHandledRef = useRef(false);

  const suggestions = [
    "Tell me about your projects.",
    "What technologies do you use?",
    "How can I get in touch with you?",
  ];

  useEffect(() => {
    setSessionId(Date.now().toString() + Math.random().toString(36).substring(2));
    setDisplayMessages([{
      text: "Hello! I'm Yahya Efe's digital assistant. Feel free to ask me anything about his projects, experiences, or any other topic.",
      sender: "ai"
    }]);
  }, []);

  useEffect(() => {
    if (!searchParams || !sessionId || queryHandledRef.current) return;
    const starterQuery = searchParams.get('q');
    if (starterQuery) { handleSendMessage(starterQuery); queryHandledRef.current = true; }
  }, [searchParams, sessionId]);

  useEffect(() => {
    if (!isLoading && inputRef.current) inputRef.current.focus();
  }, [isLoading]);

  useEffect(() => {
    if (chatContainerRef.current)
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, [displayMessages, isLoading]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); handleSendMessage(); }
  };

  const handleSendMessage = async (promptOverride?: string) => {
    const prompt = promptOverride || input;
    if (prompt.trim() === "" || isLoading || !sessionId) return;

    setShowSuggestions(false);
    setDisplayMessages(prev => [...prev, { text: prompt, sender: "user" }]);
    const currentInput = prompt;
    const currentHistory = history;
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: currentInput, history: currentHistory, sessionId }),
      });
      if (!response.ok) throw new Error("API request failed");
      const data = await response.json();
      const aiResponseText = data.text;
      if (!aiResponseText) throw new Error("Empty response from AI");

      setDisplayMessages(prev => [...prev, { text: aiResponseText, sender: "ai" }]);
      setHistory(prev => [
        ...prev,
        { role: "user", parts: [{ text: currentInput }] },
        { role: "model", parts: [{ text: aiResponseText }] },
      ]);
    } catch {
      setDisplayMessages(prev => [...prev, { text: "Sorry, an error occurred. Please try again.", sender: "ai" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Column maxWidth="m" fillWidth gap="l" style={{ height: '70vh' }}>
      <Flex ref={chatContainerRef} flex={1} direction="column" gap="l" style={{ overflowY: 'auto', paddingRight: '1rem' }}>
        {displayMessages.map((message, index) => (
          <Flex key={index} gap="16" align="start" direction={message.sender === "user" ? "row-reverse" : "row"}>
            <Avatar size="l" src={message.sender === "ai" ? avatarUrl : undefined}>
              {message.sender === 'user' && <Icon name="person" size="m" />}
            </Avatar>
            <Flex background={message.sender === "ai" ? "surface" : "brand-alpha-strong"} radius="l" paddingX="l" paddingY="m" style={{ maxWidth: '100%', overflowX: 'auto' }}>
              <ChatMessageContent content={message.text} />
            </Flex>
          </Flex>
        ))}
        {isLoading && (
          <Flex gap="16" align="start" direction="row">
            <Avatar size="l" src={avatarUrl} />
            <Flex background="surface" radius="l" paddingX="l" paddingY="m" align="center" style={{ maxWidth: '100%', overflowX: 'auto' }}>
              <TypingIndicator />
            </Flex>
          </Flex>
        )}
      </Flex>
      {showSuggestions && (
        <Flex gap="8" align="center" horizontal="center" wrap style={{ padding: '0 1rem' }}>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSendMessage(suggestion)}
              style={{ padding: '8px 16px', borderRadius: '16px', border: '1px solid var(--neutral-strong)', backgroundColor: 'var(--surface)', color: 'var(--text-default)', cursor: 'pointer', fontSize: '14px', transition: 'background-color 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--neutral-weak)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--surface)'}
            >
              {suggestion}
            </button>
          ))}
        </Flex>
      )}
      <Flex as="form" gap="16" vertical="center" className={styles.chatForm} onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
        <Flex fillWidth>
          <Input
            ref={inputRef}
            id="chat-input"
            placeholder="Ask me anything..."
            aria-label="Ask me anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
        </Flex>
        <Button type="submit" label="↑" aria-label="Send" prefixIcon="chevronUp" disabled={isLoading} />
      </Flex>
    </Column>
  );
}

export function Chat({ avatarUrl }: { avatarUrl: string }) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChatInner avatarUrl={avatarUrl} />
    </Suspense>
  );
}

"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import { Column, Flex, Input, Button, Avatar, ToggleButton } from "@/once-ui/components";
import { person } from "@/app/resources/content";
import { ChatMessageContent } from "@/components/chat/ChatMessageContent";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { User } from "lucide-react";
import styles from './chat.module.scss';

type DisplayMessage = {
  text: string;
  sender: "user" | "ai";
};

type HistoryMessage = {
  role: "user" | "model";
  parts: { text: string }[];
};

function Chat() {
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
    "Projelerin hakkında bilgi ver.",
    "Hangi teknolojileri kullanıyorsun?",
    "Seninle nasıl iletişime geçebilirim?",
  ];

  useEffect(() => {
    // Generate a unique session ID and set welcome message
    setSessionId(Date.now().toString() + Math.random().toString(36).substring(2));
    setDisplayMessages([
      {
        text: "Merhaba! Ben Yahya Efe'nin dijital asistanı. Projeleri, deneyimleri veya herhangi bir konuda merak ettiklerinizi sorabilirsiniz.",
        sender: "ai"
      }
    ]);
  }, []);

  useEffect(() => {
    if (!searchParams || !sessionId || queryHandledRef.current) return;
    const starterQuery = searchParams.get('q');
    if (starterQuery) {
      handleSendMessage(starterQuery);
      queryHandledRef.current = true;
    }
  }, [searchParams, sessionId]);

  useEffect(() => {
    // Refocus the input field whenever the loading state changes from true to false
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  useEffect(() => {
    // Auto-scroll to the bottom
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [displayMessages, isLoading]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const handleSendMessage = async (promptOverride?: string) => {
    const prompt = promptOverride || input;
    if (prompt.trim() === "" || isLoading || !sessionId) return;
    
    setShowSuggestions(false);
    const userDisplayMessage: DisplayMessage = { text: prompt, sender: "user" };
    const currentInput = prompt;
    const currentHistory = history;

    setDisplayMessages(prev => [...prev, userDisplayMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: currentInput, history: currentHistory, sessionId }),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }
      
      const data = await response.json();
      const aiResponseText = data.text;

      if (!aiResponseText) {
        throw new Error("Empty response from AI");
      }

      const aiDisplayMessage: DisplayMessage = { text: aiResponseText, sender: "ai" };
      setDisplayMessages(prev => [...prev, aiDisplayMessage]);
      
      setHistory(prev => [
        ...prev,
        { role: "user", parts: [{ text: currentInput }] },
        { role: "model", parts: [{ text: aiResponseText }] },
      ]);

    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMessage: DisplayMessage = { text: "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.", sender: "ai" };
      setDisplayMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Column maxWidth="m" fillWidth gap="l" style={{ height: '70vh' }}>
      <Flex ref={chatContainerRef} flex={1} direction="column" gap="l" style={{ overflowY: 'auto', paddingRight: '1rem' }}>
        {displayMessages.map((message, index) => (
          <Flex
            key={index}
            gap="16"
            align="start"
            direction={message.sender === "user" ? "row-reverse" : "row"}
          >
            <Avatar
              size="l"
              src={message.sender === "ai" ? person.avatar : undefined}
            >
              {message.sender === 'user' && <User />}
            </Avatar>
            <Flex
              background={message.sender === "ai" ? "surface" : "brand-alpha-strong"}
              radius="l"
              paddingX="l"
              paddingY="m"
              style={{ maxWidth: '100%', overflowX: 'auto' }}
            >
              <ChatMessageContent content={message.text} />
            </Flex>
          </Flex>
        ))}
        {isLoading && (
          <Flex gap="16" align="start" direction="row">
            <Avatar size="l" src={person.avatar} />
            <Flex
              background="surface"
              radius="l"
              paddingX="l"
              paddingY="m"
              align="center"
              style={{ maxWidth: '100%', overflowX: 'auto' }}
            >
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
              onClick={() => handleSuggestionClick(suggestion)}
              style={{
                padding: '8px 16px',
                borderRadius: '16px',
                border: '1px solid var(--neutral-strong)',
                backgroundColor: 'var(--surface)',
                color: 'var(--text-default)',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background-color 0.2s',
              }}
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
        <Button type="submit" label="↑"  aria-label="Send" prefixIcon="arrowUp" disabled={isLoading} />
      </Flex> 
    </Column>
  );
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Chat />
        </Suspense>
    )
} 
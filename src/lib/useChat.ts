// ============================================
// RECURIA — useChat Hook
// Manages chat state and API interactions
// ============================================

"use client";

import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import type { UIMessage } from "@/types";

const INITIAL_MESSAGE: UIMessage = {
  id: "welcome",
  role: "assistant",
  content: "Hey! This is Recuria, how shall I help you?",
  timestamp: new Date(),
};

export function useChat(sessionId?: string) {
  const [messages, setMessages] = useState<UIMessage[]>([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(sessionId);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const userMessage: UIMessage = {
        id: uuidv4(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
        isNew: true,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      // Build history (exclude welcome message, last 20 exchanges)
      const history = messages
        .filter((m) => m.id !== "welcome")
        .slice(-20)
        .map((m) => ({ role: m.role, content: m.content }));

      // ✅ Detect clinic from URL
      const clinic =
        typeof window !== "undefined"
          ? window.location.pathname.split("/")[1] || "apollo"
          : "apollo";

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content.trim(),
            session_id: currentSessionId,
            history,
            clinic, // ✅ sent to API
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error ?? "Something went wrong");
        }

        if (data.session_id && !currentSessionId) {
          setCurrentSessionId(data.session_id);
        }

        // Assistant response
        const assistantMessage: UIMessage = {
          id: uuidv4(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          isNew: true,
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        const errorText =
          err instanceof Error ? err.message : "Failed to get response";
        setError(errorText);

        setMessages((prev) => [
          ...prev,
          {
            id: uuidv4(),
            role: "assistant",
            content: `I encountered an issue: ${errorText}. Please try again.`,
            timestamp: new Date(),
            isNew: true,
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, currentSessionId]
  );

  const clearMessages = useCallback(() => {
    setMessages([INITIAL_MESSAGE]);
    setCurrentSessionId(undefined);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sessionId: currentSessionId,
    sendMessage,
    clearMessages,
  };
}
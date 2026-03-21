// ============================================
// RECURIA — useChat Hook
// Manages chat state and API interactions
// ============================================
"use client";
import { useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import type { UIMessage } from "@/types";

const STORAGE_KEY = "recuria_sessions";

function getInitialMessage(): UIMessage {
  const slug = typeof window !== "undefined" ? window.location.pathname.split("/")[1] : "";
  const name = slug
    ? slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())
    : "Recuria";
  return {
    id: "welcome",
    role: "assistant",
    content: `Hey! This is ${name}, how shall I help you?`,
    timestamp: new Date(),
  };
}

function getSavedSessions() {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function persistSessions(sessions: any[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function useChat(sessionId?: string) {
  const [messages, setMessages] = useState<UIMessage[]>([getInitialMessage()]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(sessionId);
  const [sessions, setSessions] = useState<{ id: string; title: string; active: boolean }[]>([]);

  useEffect(() => {
    const saved = getSavedSessions();
    setSessions(saved.map((s: any, i: number) => ({ ...s, active: i === 0 })));
  }, []);

  const loadSession = useCallback((id: string) => {
    const saved = getSavedSessions();
    const session = saved.find((s: any) => s.id === id);
   if (session?.messages) {
  setMessages(session.messages.map((m: any) => ({
    ...m,
    timestamp: new Date(m.timestamp),
  })));
  setCurrentSessionId(id);
      setSessions(saved.map((s: any) => ({ ...s, active: s.id === id })));
    }
  }, []);

  const saveSession = useCallback((msgs: UIMessage[], sessId?: string) => {
    const saved = getSavedSessions();
    const title = msgs.find(m => m.role === "user")?.content?.slice(0, 40) || "New Session";
    if (sessId) {
      const idx = saved.findIndex((s: any) => s.id === sessId);
      if (idx > -1) { saved[idx] = { ...saved[idx], messages: msgs, title }; }
      else { saved.unshift({ id: sessId, title, messages: msgs }); }
      persistSessions(saved);
      setSessions(saved.map((s: any) => ({ ...s, active: s.id === sessId })));
      return sessId;
    } else {
      const newId = uuidv4();
      saved.unshift({ id: newId, title, messages: msgs });
      persistSessions(saved);
      setSessions(saved.map((s: any, i: number) => ({ ...s, active: i === 0 })));
      return newId;
    }
  }, []);

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

      const history = messages
        .filter((m) => m.id !== "welcome")
        .slice(-20)
        .map((m) => ({ role: m.role, content: m.content }));

      const clinic =
  typeof window !== "undefined"
    ? window.location.pathname.split("/")[1] || ""
    : "";

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content.trim(),
            session_id: currentSessionId,
            history,
            clinic,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Something went wrong");

        if (data.session_id && !currentSessionId) {
          setCurrentSessionId(data.session_id);
        }

        const assistantMessage: UIMessage = {
          id: uuidv4(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          isNew: true,
        };

        setMessages((prev) => [...prev, assistantMessage]);

        const allMsgs = [...messages.filter(m => m.id !== "welcome"), userMessage, assistantMessage];
        const newSessId = saveSession(allMsgs, currentSessionId);
        if (!currentSessionId) setCurrentSessionId(newSessId);

      } catch (err) {
        const errorText = err instanceof Error ? err.message : "Failed to get response";
        setError(errorText);
        setMessages((prev) => [...prev, {
          id: uuidv4(),
          role: "assistant",
          content: `I encountered an issue: ${errorText}. Please try again.`,
          timestamp: new Date(),
          isNew: true,
        }]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, currentSessionId, saveSession]
  );

  const clearMessages = useCallback(() => {
    setMessages([getInitialMessage()]);
    setCurrentSessionId(undefined);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sessionId: currentSessionId,
    sessions,
    loadSession,
    sendMessage,
    clearMessages,
  };
}

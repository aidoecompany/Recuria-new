// ============================================
// RECURIA — useChat Hook
// Manages chat state and API interactions
// ============================================
"use client";
import { useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { createClient } from "@/lib/supabase/client";
import type { UIMessage } from "@/types";

const supabase = createClient();

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

export function useChat(sessionId?: string) {
  const [messages, setMessages] = useState<UIMessage[]>([getInitialMessage()]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(sessionId);
  const [sessions, setSessions] = useState<{ id: string; title: string; active: boolean }[]>([]);

  // Load sessions list on mount
  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("conversations")
      .select("id, title, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) {
      setSessions(data.map((s, i) => ({ id: s.id, title: s.title || "Untitled", active: i === 0 })));
    }
  }

  async function loadSession(id: string) {
    const { data } = await supabase
      .from("conversations")
      .select("messages")
      .eq("id", id)
      .single();
    if (data?.messages) {
      setMessages(data.messages);
      setCurrentSessionId(id);
      setSessions(prev => prev.map(s => ({ ...s, active: s.id === id })));
    }
  }

  async function saveConversation(msgs: UIMessage[], sessId?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const title = msgs.find(m => m.role === "user")?.content?.slice(0, 40) || "New Session";
    if (sessId) {
      await supabase.from("conversations").update({ messages: msgs, title }).eq("id", sessId);
    } else {
      const { data } = await supabase.from("conversations").insert({
        user_id: user.id,
        title,
        messages: msgs,
      }).select().single();
      return data?.id;
    }
  }

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

        const newMessages = [...messages, userMessage, assistantMessage];
        setMessages(prev => [...prev, assistantMessage]);

        // Save to Supabase
        const allMsgs = [...messages.filter(m => m.id !== "welcome"), userMessage, assistantMessage];
        const newSessId = await saveConversation(allMsgs, currentSessionId);
        if (newSessId) {
          setCurrentSessionId(newSessId);
          loadSessions();
        }

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
    [messages, isLoading, currentSessionId]
  );

  const clearMessages = useCallback(() => {
    setMessages([getInitialMessage()]);
    setCurrentSessionId(undefined);
    setError(null);
    loadSessions();
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

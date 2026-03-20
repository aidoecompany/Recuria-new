// ============================================
// RECURIA — ChatWindow Component
// Main chat interface orchestrator
// ============================================

"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageBubble, TypingIndicator } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { Sidebar } from "./Sidebar";
import { useChat } from "@/lib/useChat";

export function ChatWindow() {
  const { messages, isLoading, sendMessage, clearMessages, sessions, loadSession } = useChat();
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  const handleNewChat = () => {
    clearMessages();
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f8f6]">
      {/* Sidebar */}
      <Sidebar
  isOpen={sidebarOpen}
  onClose={() => setSidebarOpen(false)}
  onNewChat={handleNewChat}
  sessions={sessions}
  onLoadSession={loadSession}
  isDesktop={false}
/>
      <Sidebar
  isOpen={sidebarOpen}
  onClose={() => setSidebarOpen(false)}
  onNewChat={handleNewChat}
  sessions={sessions}
  onLoadSession={loadSession}
/>
      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-[60px] flex items-center justify-between px-6 bg-[#f8f8f6]/90 backdrop-blur-xl border-b border-black/[0.06] flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
              onClick={() => setSidebarOpen(true)}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div>
              <span className="font-serif text-[18px] tracking-tight text-gray-950">
                Recuria
              </span>
              <span className="text-[12px] text-gray-400 ml-2 hidden sm:inline">
                powered by Aidoe
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10.5px] font-semibold bg-[#edf5e6] text-[#4a7a2a] px-3 py-1 rounded-full tracking-wide">
              ● AI Active
            </span>
          </div>
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin py-8">
          {/* Welcome card */}
          {messages.length <= 1 && (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.1 }}
    className="max-w-[480px] mx-auto text-center px-6 pb-8"
  >
    <h2 className="font-serif text-[22px] text-gray-950 mb-2">
  AI Assistant
</h2>
<p className="text-[14px] text-gray-500 mt-1">
  Your Personalised Assistant is right here! Go ahead and ask me
</p>
  </motion.div>
)}
          <div className="max-w-[720px] mx-auto px-6">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isLoading && <TypingIndicator key="typing" />}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

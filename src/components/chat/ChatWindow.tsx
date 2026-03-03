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
  const { messages, isLoading, sendMessage, clearMessages } = useChat();
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
      <div className="hidden lg:flex">
        <Sidebar
          isOpen={true}
          onClose={() => {}}
          onNewChat={handleNewChat}
        />
      </div>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
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
              ● Clinical AI Active
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
              <div className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-[#e8f4dd] to-[#c8e6b0] flex items-center justify-center text-2xl mx-auto mb-4">
                🩺
              </div>
              <h2 className="font-serif text-[22px] text-gray-950 mb-2">
                Clinical AI Assistant
              </h2>
              <p className="text-[13.5px] text-gray-400 leading-relaxed">
                Ask me about symptoms, medications, clinical guidelines, drug
                interactions, and more. Built for healthcare professionals.
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-5">
                {[
                  "Drug interactions",
                  "Symptom analysis",
                  "Dosage guidance",
                  "Clinical guidelines",
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => {
                      setInput(chip);
                    }}
                    className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700 transition-colors bg-white"
                  >
                    {chip}
                  </button>
                ))}
              </div>
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

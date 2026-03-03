// ============================================
// RECURIA — MessageBubble Component
// ============================================

"use client";

import { motion } from "framer-motion";
import type { UIMessage } from "@/types";

interface MessageBubbleProps {
  message: UIMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const time = message.timestamp.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-5`}
    >
      {/* AI Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#e8f4dd] to-[#c8e6b0] text-[#3a6a1a] text-[13px] font-semibold flex items-center justify-center flex-shrink-0 mr-2.5 mt-0.5">
          R
        </div>
      )}

      <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-[80%]`}>
        <div
          className={`
            px-4 py-3 text-[14.5px] leading-relaxed whitespace-pre-wrap break-words
            ${
              isUser
                ? "bg-gray-950 text-white rounded-[16px_4px_16px_16px]"
                : "bg-white text-gray-900 rounded-[4px_16px_16px_16px] shadow-subtle border border-black/[0.04]"
            }
          `}
        >
          {message.content}
        </div>
        <span className="text-[10px] text-gray-300 mt-1 px-1">{time}</span>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-[10px] bg-gray-950 text-white text-[13px] font-semibold flex items-center justify-center flex-shrink-0 ml-2.5 mt-0.5">
          U
        </div>
      )}
    </motion.div>
  );
}

// ─── Typing Indicator ──────────────────────────────────────────────────────
export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.2 }}
      className="flex justify-start mb-5"
    >
      <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#e8f4dd] to-[#c8e6b0] text-[#3a6a1a] text-[13px] font-semibold flex items-center justify-center flex-shrink-0 mr-2.5 mt-0.5">
        R
      </div>
      <div className="bg-white border border-black/[0.04] shadow-subtle rounded-[4px_16px_16px_16px] px-4 py-3">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-gray-300"
              animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// RECURIA — ChatInput Component
// ============================================

"use client";

import { useRef, KeyboardEvent, ChangeEvent } from "react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
}

export function ChatInput({ value, onChange, onSend, isLoading }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    // Auto-resize
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const canSend = value.trim().length > 0 && !isLoading;

  return (
    <div className="px-6 py-4 bg-[#f8f8f6]/95 backdrop-blur border-t border-black/[0.06] flex-shrink-0">
      <div className="max-w-[720px] mx-auto">
        <div
          className={`
            flex items-end gap-2 bg-white border rounded-[16px] px-4 py-2
            shadow-card transition-all duration-200
            ${
              canSend || value.length > 0
                ? "border-brand-500/40 shadow-input"
                : "border-black/[0.09]"
            }
          `}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKey}
            placeholder="Ask a clinical question..."
            rows={1}
            className="
              flex-1 bg-transparent border-none outline-none resize-none
              text-[14.5px] text-gray-900 placeholder-gray-300
              py-1 leading-relaxed
              min-h-[24px] max-h-[120px]
              font-sans
            "
            style={{ fontFamily: "inherit" }}
          />
          <button
            onClick={onSend}
            disabled={!canSend}
            className={`
              w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0
              transition-all duration-150
              ${
                canSend
                  ? "bg-gray-950 text-white hover:bg-gray-800 active:scale-95"
                  : "bg-gray-100 text-gray-300 cursor-not-allowed"
              }
            `}
          >
            {isLoading ? (
              <svg
                className="animate-spin"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>

        <p className="text-center text-[11px] text-gray-300 mt-2.5">
          Recuria is an AI assistant and does not replace professional medical judgment.
        </p>
      </div>
    </div>
  );
}

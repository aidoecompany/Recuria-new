// ============================================
// RECURIA — Sidebar Component
// ============================================

"use client";

import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
}

const mockSessions = [
  { id: "1", title: "Current Session", active: true },
  { id: "2", title: "Hypertension Query", active: false },
  { id: "3", title: "Drug Interaction Check", active: false },
  { id: "4", title: "Patient Symptoms Review", active: false },
  { id: "5", title: "Lab Results Analysis", active: false },
];

export function Sidebar({ isOpen, onClose, onNewChat }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/20 z-10 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-20
          w-64 bg-white border-r border-black/[0.06]
          flex flex-col
          lg:translate-x-0
          transition-transform duration-300
        `}
        initial={false}
        animate={{ x: isOpen ? 0 : "-100%" }}
        style={{ translateX: undefined }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Logo */}
        <div className="px-6 py-7 border-b border-black/[0.05]">
          <div className="font-serif text-[22px] tracking-tight text-gray-950">
            Recuria
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5 tracking-wide">
            powered by Aidoe
          </div>
        </div>

        {/* New Chat */}
        <div className="px-3 pt-4">
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-2 px-4 py-2.5 bg-gray-950 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Session
          </button>
        </div>

        {/* Sessions */}
        <div className="flex-1 overflow-y-auto pt-2 pb-4 scrollbar-thin">
          <div className="px-5 pt-4 pb-2 text-[10px] font-semibold tracking-widest text-gray-300 uppercase">
            Recent
          </div>
          {mockSessions.map((session) => (
            <button
              key={session.id}
              className={`
                w-full flex items-center gap-2.5 px-5 py-2.5 text-left rounded-xl mx-2 transition-colors
                ${
                  session.active
                    ? "bg-gray-100 text-gray-950 font-medium"
                    : "text-gray-500 hover:bg-gray-50"
                }
              `}
              style={{ width: "calc(100% - 16px)" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                  background: session.active ? "#5a8a3a" : "#c7d8b0",
                }}
              />
              <span className="text-[13.5px] truncate">{session.title}</span>
            </button>
          ))}
        </div>

        {/* Footer disclaimer */}
        <div className="px-5 py-4 border-t border-black/[0.05]">
          <div className="text-[10.5px] text-gray-300 leading-relaxed">
            <span className="font-medium text-gray-400 block mb-1">
              Medical AI Platform
            </span>
            Recuria is an AI assistant and does not replace professional medical
            judgment.
          </div>
        </div>
      </motion.aside>
    </>
  );
}

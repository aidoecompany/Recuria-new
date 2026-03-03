// ============================================
// RECURIA — Shared TypeScript Types
// ============================================

export type UserRole = "admin" | "doctor" | "staff";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title?: string;
  created_at: string;
}

export interface Message {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

// API types
export interface ChatRequest {
  message: string;
  session_id?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface ChatResponse {
  content: string;
  session_id: string;
  message_id: string;
}

export interface ApiError {
  error: string;
  code?: string;
}

// UI types
export interface UIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isNew?: boolean;
}

// ============================================
// RECURIA — /api/chat Route
// Handles AI completion + Supabase persistence
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { getAICompletion } from "@/lib/ai/service";
import { checkRateLimit } from "@/lib/rateLimit";
import { createClient, createServiceClient } from "@/lib/supabase/server";

// ─── Validation Schema ─────────────────────────────────────────────────────
const ChatRequestSchema = z.object({
  message: z.string().min(1, "Message required").max(4000, "Message too long"),
  session_id: z.string().uuid().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(4000),
      })
    )
    .max(50, "Too many history items")
    .optional()
    .default([]),
});

// ─── POST /api/chat ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // 1. Rate limiting
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    const rateCheck = checkRateLimit(`chat:${ip}`);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait before sending more messages." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateCheck.resetAt.toString(),
          },
        }
      );
    }

    // 2. Auth check (optional — remove for public demo)
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    // For unauthenticated demo mode, we allow requests without a user
    // In production, uncomment below:
    // if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 3. Parse and validate body
    const rawBody = await req.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = ChatRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    const { message, session_id, history } = parsed.data;

    // 4. Determine or create session
    let sessionId = session_id;
    if (!sessionId && user) {
      const serviceClient = createServiceClient();
      const { data: session, error: sessionError } = await serviceClient
        .from("chat_sessions")
        .insert({ id: uuidv4(), user_id: user.id })
        .select("id")
        .single();

      if (sessionError) {
        console.error("Session creation error:", sessionError);
      } else {
        sessionId = session.id;
      }
    }

    // 5. Build message history for AI
    const aiMessages = [
      ...(history ?? []),
      { role: "user" as const, content: message },
    ];

    // 6. Call AI service (modular — swap providers in .env)
    const aiResult = await getAICompletion({ messages: aiMessages });

    // 7. Persist messages to Supabase (if session exists)
    if (sessionId && user) {
      const serviceClient = createServiceClient();
      const now = new Date().toISOString();
      await serviceClient.from("messages").insert([
        {
          id: uuidv4(),
          session_id: sessionId,
          role: "user",
          content: message,
          timestamp: now,
        },
        {
          id: uuidv4(),
          session_id: sessionId,
          role: "assistant",
          content: aiResult.content,
          timestamp: now,
        },
      ]);
    }

    // 8. Return response
    return NextResponse.json(
      {
        content: aiResult.content,
        session_id: sessionId ?? null,
        provider: aiResult.provider,
        model: aiResult.model,
      },
      {
        headers: {
          "X-RateLimit-Remaining": rateCheck.remaining.toString(),
        },
      }
    );
  } catch (error) {
    console.error("Chat API error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── GET /api/chat — Not allowed ──────────────────────────────────────────
export function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

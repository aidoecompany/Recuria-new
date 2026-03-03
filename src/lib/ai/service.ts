// ============================================
// RECURIA — AI Service Layer (Modular)
// Swap AI providers by changing ACTIVE_AI_PROVIDER in .env
// Supported: claude | openai
// ============================================

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AICompletionOptions {
  messages: AIMessage[];
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AICompletionResult {
  content: string;
  provider: string;
  model: string;
}

// ─── Medical System Prompt ─────────────────────────────────────────────────
export const MEDICAL_SYSTEM_PROMPT = `You are Recuria, an advanced AI medical assistant built for clinical environments. 
You assist doctors, nurses, and clinical staff with:
- Symptom analysis and differential diagnosis support
- Drug interactions and dosing guidance
- Clinical guidelines and evidence-based recommendations
- Medical terminology and documentation
- Lab result interpretation
- Treatment protocol summaries

Be conversational but professional. Use clear formatting with bullet points or numbered lists when helpful. 
Always remind users when a query requires hands-on clinical judgment. 
Never provide definitive diagnoses — always frame as clinical decision support.
Keep responses concise but comprehensive. Cite guidelines when relevant.`;

// ─── Claude Provider ───────────────────────────────────────────────────────
async function callClaude(options: AICompletionOptions): Promise<AICompletionResult> {
  const model = "claude-opus-4-6";
  
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: options.maxTokens ?? 1024,
      system: options.systemPrompt ?? MEDICAL_SYSTEM_PROMPT,
      messages: options.messages,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`Claude API error ${response.status}: ${JSON.stringify(err)}`);
  }

  const data = await response.json();
  const content = data.content
    ?.filter((b: { type: string }) => b.type === "text")
    .map((b: { text: string }) => b.text)
    .join("") ?? "";

  return { content, provider: "claude", model };
}

// ─── OpenAI Provider ───────────────────────────────────────────────────────
async function callOpenAI(options: AICompletionOptions): Promise<AICompletionResult> {
  const model = process.env.OPENAI_MODEL ?? "gpt-4o";

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: options.maxTokens ?? 1024,
      messages: [
        { role: "system", content: options.systemPrompt ?? MEDICAL_SYSTEM_PROMPT },
        ...options.messages,
      ],
      temperature: options.temperature ?? 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error ${response.status}: ${JSON.stringify(err)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? "";

  return { content, provider: "openai", model };
}

// ─── Public Interface ──────────────────────────────────────────────────────
export async function getAICompletion(
  options: AICompletionOptions
): Promise<AICompletionResult> {
  const provider = process.env.ACTIVE_AI_PROVIDER ?? "claude";

  switch (provider) {
    case "openai":
      return callOpenAI(options);
    case "claude":
    default:
      return callClaude(options);
  }
}

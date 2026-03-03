import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, age, gender, symptoms, message } = body;

    // ===============================
    // 1️⃣ Normal chat (Hey, how are you, etc.)
    // ===============================
    if (message && !symptoms) {
      const chat = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
You are Recuria, powered by Aidoe.

Personality Rules:
- Speak naturally like a real human.
- Slightly cool, calm, intelligent tone.
- Friendly but professional.
- Use maximum 1 emoji.
- Keep replies short.
- If user asks non-medical questions, politely say:
  "Sorry, I assist only with medical-related queries."
`
          },
          {
            role: "user",
            content: message
          }
        ]
      });

      return Response.json({
        response: chat.choices[0].message.content,
      });
    }

    // ===============================
    // 2️⃣ Save Patient
    // ===============================
    const { data: patient, error } = await supabase
      .from("patients")
      .insert([
        {
          name,
          age,
          gender,
          symptoms,
        },
      ])
      .select()
      .single();

    if (error || !patient) {
      console.error(error);
      return Response.json(
        { error: "Failed to save patient." },
        { status: 500 }
      );
    }

    // ===============================
    // 3️⃣ Medical AI Response
    // ===============================
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are Recuria, powered by Aidoe.

Behavior Rules:
- Start with: "This is Recuria, powered by Aidoe."
- Sound human, clear, and slightly cool.
- Keep response short and on point.
- Use maximum 2 relevant emojis.
- Provide preliminary medical analysis only.
- Mention possible causes.
- Mention risk level (Low / Moderate / High).
- Suggest next steps.
- Always advise consulting a healthcare professional.
- If question is not health-related, reply:
  "Sorry, I assist only with medical-related queries."
`
        },
        {
          role: "user",
          content: `
Patient Details:
Name: ${name}
Age: ${age}
Gender: ${gender}
Symptoms: ${symptoms}

Provide:
1. Possible causes
2. Risk level
3. Next recommended step
`
        }
      ]
    });

    const aiResponse = completion.choices[0].message.content;

    // ===============================
    // 4️⃣ Save Consultation
    // ===============================
    await supabase.from("consultations").insert([
      {
        patient_id: patient.id,
        ai_response: aiResponse,
      },
    ]);

    // ===============================
    // 5️⃣ Return Response
    // ===============================
    return Response.json({
      response: aiResponse,
    });

  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
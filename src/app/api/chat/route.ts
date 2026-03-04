export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { message, name, age, gender, symptoms, clinic, history = [] } = body;

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    let clinicPrompt = "";

    if (clinic) {

      let departments: any[] = [];
      let doctors: any[] = [];
      let timings: any[] = [];

      // ===============================
      // SUNSHINE CLINIC
      // ===============================
      if (clinic === "sunshine") {

        const { data: dep } = await supabase
          .from("sundep")
          .select("*");

        const { data: doc } = await supabase
          .from("sundoctors")
          .select("*");

        const { data: tim } = await supabase
          .from("suntimings")
          .select("*");

        departments = dep || [];
        doctors = doc || [];
        timings = tim || [];

      }

      // ===============================
      // APOLLO CLINIC
      // ===============================
      else if (clinic === "apollo") {

        const { data: dep } = await supabase
          .from("departments")
          .select("*");

        const { data: doc } = await supabase
          .from("doctors")
          .select("*");

        departments = dep || [];
        doctors = doc || [];

      }

      clinicPrompt = `
You are the AI assistant for ${clinic} clinic.

Clinic Departments:
${departments?.map((d:any) =>
  `- ${d.department_name || d.name} (${d.floor || d.location || ""})`
).join("\n")}

Doctors:
${doctors?.map((d:any) =>
  `- ${d.doctor_name || d.name} (${d.department || d.specialty || ""})`
).join("\n")}

Doctor Timings:
${timings?.map((t:any) =>
  `- ${t.doctor_name}: ${t.day} ${t.start_time} - ${t.end_time}`
).join("\n")}

Help patients with clinic information, navigation, and doctor availability.

IMPORTANT:
Only use the clinic data provided above.
Never invent departments, doctors, or schedules.
If information is missing, politely say it is not available in the clinic database.
`;
    }

    // ===============================
    // NORMAL CHAT
    // ===============================
    if (message && !symptoms) {
      const chat = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
${clinicPrompt}

You are Recuria, powered by Aidoe.

Personality:
- Natural, warm and human.
- Slightly cool but professional.
- Keep answers short.
- Use max 1 emoji.

Rules:
- Respond normally to greetings.
- Light small talk allowed.
- If clearly non-medical topic, politely redirect.
`
          },
          ...history,
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
    // MEDICAL FLOW
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
      return Response.json(
        { error: "Failed to save patient." },
        { status: 500 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
${clinicPrompt}

You are Recuria, powered by Aidoe.

Rules:
- Sound confident and human.
- Structured and concise.
- Use max 2 emojis.
- Mention causes.
- Mention risk level.
- Suggest next steps.
- Recommend consulting doctor.
`
        },
        ...history,
        {
          role: "user",
          content: `
Patient:
Name: ${name}
Age: ${age}
Gender: ${gender}
Symptoms: ${symptoms}

Provide:
1. Possible causes
2. Risk level
3. Next step
`
        }
      ]
    });

    const aiResponse = completion.choices[0].message.content;

    await supabase.from("consultations").insert([
      {
        patient_id: patient.id,
        ai_response: aiResponse,
      },
    ]);

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
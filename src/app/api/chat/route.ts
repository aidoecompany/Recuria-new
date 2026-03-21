export const dynamic = "force-dynamic";

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, name, age, gender, symptoms, clinic, history = [], userEmail } = body;

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── Trial check ──────────────────────────────────────────
const UNLIMITED = ["sanchaykrishna15@gmail.com", "hari8haran8@gmail.com", "aidoecompany@gmail.com"];
if (userEmail && !UNLIMITED.includes(userEmail) && !clinic) {
  const { data: extData } = await supabase.from("extended_users").select("email").eq("email", userEmail).single();
  if (!extData) {
    const { data: userData } = await supabase.auth.admin.listUsers();
    const foundUser = userData?.users?.find((u: any) => u.email === userEmail);
    if (foundUser) {
      const created = new Date(foundUser.created_at);
      const diffDays = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays > 7) {
        return Response.json({
          response: "⚠️ Your trial version is only available for 7 days. Upgrade for more usage."
        });
      }
    }
  }
}
// ─────────────────────────────────────────────────────────

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    let clinicPrompt = "";

    if (clinic) {
      let departments: any[] = [];
      let doctors: any[] = [];
      let timings: any[] = [];

      if (clinic === "sunshine") {
        const { data: dep } = await supabase.from("sundep").select("*");
        const { data: doc } = await supabase.from("sundoctors").select("*");
        const { data: tim } = await supabase.from("suntimings").select("*");
        departments = dep || [];
        doctors = doc || [];
        timings = tim || [];

        clinicPrompt = `
You are the AI assistant for Sunshine clinic.

Clinic Departments:
${departments.map((d: any) => `- ${d.department_name || d.name} (${d.floor || d.location || ""})`).join("\n")}

Doctors:
${doctors.map((d: any) => `- ${d.doctor_name || d.name} (${d.department || d.specialty || ""})`).join("\n")}

Doctor Timings:
${timings.map((t: any) => `- ${t.doctor_name}: ${t.day} ${t.start_time} - ${t.end_time}`).join("\n")}

IMPORTANT: Only use the clinic data provided above. Never invent departments, doctors, or schedules.
`;

      } else if (clinic === "apollo") {
        const { data: dep } = await supabase.from("departments").select("*");
        const { data: doc } = await supabase.from("doctors").select("*");
        departments = dep || [];
        doctors = doc || [];

        clinicPrompt = `
You are the AI assistant for Apollo clinic.

Clinic Departments:
${departments.map((d: any) => `- ${d.department_name || d.name} (${d.floor || d.location || ""})`).join("\n")}

Doctors:
${doctors.map((d: any) => `- ${d.doctor_name || d.name} (${d.department || d.specialty || ""})`).join("\n")}

IMPORTANT: Only use the clinic data provided above. Never invent departments, doctors, or schedules.
`;

      } else {
        // ✅ Load from businesses table by slug
        const { data: biz } = await supabase
          .from("businesses")
          .select("*")
          .eq("slug", clinic)
          .single();

        if (biz) {
          const { data: svcs } = await supabase.from("services").select("*").eq("owner_email", biz.owner_email);
          const { data: faqRows } = await supabase.from("faqs").select("*").eq("owner_email", biz.owner_email);

          clinicPrompt = `
You are the AI assistant for ${biz.business_name}.
Business Hours: ${biz.address || "Not specified"}

Services Offered:
${(svcs || []).map((s: any) => `- ${s.title}`).join("\n")}

Frequently Asked Questions:
${(faqRows || []).map((f: any) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")}

IMPORTANT: Only use the information provided above. Never invent services or FAQs.
If information is missing, politely say it is not available.
`;
        }
      }
    }

    // NORMAL CHAT
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
          { role: "user", content: message }
        ]
      });

      return Response.json({ response: chat.choices[0].message.content });
    }

    // MEDICAL FLOW
    const { data: patient, error } = await supabase
      .from("patients")
      .insert([{ name, age, gender, symptoms }])
      .select()
      .single();

    if (error || !patient) {
      return Response.json({ error: "Failed to save patient." }, { status: 500 });
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
          content: `Patient: ${name}, Age: ${age}, Gender: ${gender}, Symptoms: ${symptoms}`
        }
      ]
    });

    const aiResponse = completion.choices[0].message.content;
    await supabase.from("consultations").insert([{ patient_id: patient.id, ai_response: aiResponse }]);

    return Response.json({ response: aiResponse });

  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error." }, { status: 500 });
  }
}

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

      if (clinic === "sunshine") {
        const { data: dep } = await supabase.from("sundep").select("*");
        const { data: doc } = await supabase.from("sundoctors").select("*");
        const { data: tim } = await supabase.from("suntimings").select("*");
        departments = dep || [];
        doctors = doc || [];
        timings = tim || [];
      } else if (clinic === "apollo") {
        const { data: dep } = await supabase.from("departments").select("*");
        const { data: doc } = await supabase.from("doctors").select("*");
        departments = dep || [];
        doctors = doc || [];
      }

      // ✅ Load business data saved from dashboard
      const { data: business } = await supabase
        .from("businesses")
        .select("*")
        .eq("business_name", clinic)
        .single();

      const { data: services } = await supabase
        .from("services")
        .select("*")
        .eq("owner_email", business?.owner_email || "");

      const { data: faqs } = await supabase
        .from("faqs")
        .select("*")
        .eq("owner_email", business?.owner_email || "");

      const businessBlock = business ? `
Business Name: ${business.business_name}
Phone: ${business.phone_number || "N/A"}
Address: ${business.address || "N/A"}
` : "";

      const servicesBlock = services?.length ? `
Services Offered:
${services.map((s: any) => `- ${s.title}${s.description ? `: ${s.description}` : ""}`).join("\n")}
` : "";

      const faqsBlock = faqs?.length ? `
Frequently Asked Questions:
${faqs.map((f: any) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")}
` : "";

      clinicPrompt = `
You are the AI assistant for ${clinic} clinic.

${businessBlock}
${servicesBlock}
${faqsBlock}

Clinic Departments:
${departments.map((d: any) => `- ${d.department_name || d.name} (${d.floor || d.location || ""})`).join("\n")}

Doctors:
${doctors.map((d: any) => `- ${d.doctor_name || d.name} (${d.department || d.specialty || ""})`).join("\n")}

Doctor Timings:
${timings.map((t: any) => `- ${t.doctor_name}: ${t.day} ${t.start_time} - ${t.end_time}`).join("\n")}

Help patients with clinic information, navigation, and doctor availability.

IMPORTANT:
Only use the clinic data provided above.
Never invent departments, doctors, schedules, services, or FAQs.
If information is missing, politely say it is not available.
`;
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

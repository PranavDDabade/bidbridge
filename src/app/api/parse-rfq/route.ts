import { rfqSchema } from "@/lib/schema";
import { SYSTEM_PROMPT } from "@/lib/prompts";

// Lite first (faster, rarely overloaded), then the standard Flash model
const MODELS = ["gemini-flash-lite-latest", "gemini-flash-latest"];

async function callLLM(text: string, model: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": process.env.LLM_API_KEY ?? "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text }] }],
        generationConfig: { temperature: 0, responseMimeType: "application/json" },
      }),
      signal: AbortSignal.timeout(20000),
    }
  );
  if (!res.ok) throw new Error(`LLM request failed: ${res.status} (${model})`);
  const data = await res.json();
  const out = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!out) throw new Error(`Empty LLM response (${model})`);
  return JSON.parse(out);
}

export async function POST(req: Request) {
  let text = "";
  try {
    ({ text } = await req.json());
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  if (typeof text !== "string" || text.trim().length < 3 || text.length > 2000) {
    return Response.json(
      { ok: false, error: "Please describe what you need (3 to 2000 characters)." },
      { status: 400 }
    );
  }

  // One attempt per model: if the first is overloaded or returns bad JSON,
  // fall through to the next one, then to the manual form on the client.
  for (const model of MODELS) {
    try {
      const raw = await callLLM(text.trim(), model);
      const parsed = rfqSchema.safeParse(raw);
      if (parsed.success) return Response.json({ ok: true, data: parsed.data });
      console.error(`parse-rfq schema mismatch (${model})`, JSON.stringify(parsed.error.issues));
    } catch (e) {
      console.error("parse-rfq attempt failed", e);
    }
  }

  return Response.json({
    ok: false,
    error: "The AI couldn't read that. You can fill in the details manually.",
  });
}
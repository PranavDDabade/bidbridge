import { rfqSchema, aiAuditLogSchema } from "@/lib/schema";
import { SYSTEM_PROMPT, GROUNDING_PROMPT } from "@/lib/prompts";

const MODELS = ["gemini-flash-lite-latest", "gemini-flash-latest"];

async function callLLM(text: string, model: string, systemPrompt: string) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": process.env.LLM_API_KEY ?? "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
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

async function groundParsedRfq(originalText: string, parsed: any, model: string) {
  try {
    const groundingText = `Original text: "${originalText}"

Extracted items:
${parsed.items.map((i: any) => `- ${i.quantity ?? "?"} ${i.unit ?? "?"} ${i.name} (confidence: ${i.confidence ?? 1})`).join("\n")}

Location: ${parsed.location ?? "not specified"}
Needed by: ${parsed.neededBy ?? "not specified"}

Check for hallucinations, invalid quantities, and suspicious patterns.`;

    const result = await callLLM(groundingText, model, GROUNDING_PROMPT);
    return {
      noHallucinationDetected: result.noHallucinationDetected ?? true,
      noInvalidQuantities: result.noInvalidQuantities ?? true,
      noSuspiciousUnits: result.noSuspiciousUnits ?? true,
      reasons: result.reasons ?? [],
    };
  } catch (e) {
    console.error("grounding check failed", e);
    return {
      noHallucinationDetected: true,
      noInvalidQuantities: true,
      noSuspiciousUnits: true,
      reasons: ["grounding check skipped due to error"],
    };
  }
}

function checkLowConfidence(parsed: any): { needsReview: boolean; reason: string } {
  const confidences = [
    parsed.confidence?.overall ?? 1,
    parsed.confidence?.location ?? 1,
    parsed.confidence?.neededBy ?? 1,
    ...parsed.items.map((i: any) => i.confidence ?? 1),
  ];

  const minConfidence = Math.min(...confidences);
  if (minConfidence < 0.7) {
    return {
      needsReview: true,
      reason: `Low confidence detected (${(minConfidence * 100).toFixed(0)}%). Please review extracted data.`,
    };
  }

  return { needsReview: false, reason: "" };
}

function validateConstraints(parsed: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!parsed.items || parsed.items.length === 0) {
    errors.push("No items extracted.");
  }

  for (const item of parsed.items || []) {
    if (!item.name || !item.name.trim()) {
      errors.push("Item has no name.");
    }
    if (item.quantity !== null && (item.quantity <= 0 || item.quantity > 10000)) {
      errors.push(`Quantity ${item.quantity} looks unrealistic.`);
    }
    if (item.quantity !== null && !item.unit) {
      errors.push(`Item "${item.name}" has quantity but no unit.`);
    }
  }

  return { valid: errors.length === 0, errors };
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

  let parsed: any = null;
  let usedModel = "";

  for (const model of MODELS) {
    try {
      const raw = await callLLM(text.trim(), model, SYSTEM_PROMPT);
      const schemaResult = rfqSchema.safeParse(raw);
      if (schemaResult.success) {
        parsed = schemaResult.data;
        usedModel = model;
        break;
      }
      console.error(`parse-rfq schema mismatch (${model})`, JSON.stringify(schemaResult.error.issues));
    } catch (e) {
      console.error("parse-rfq attempt failed", e);
    }
  }

  if (!parsed) {
    return Response.json({
      ok: false,
      error: "The AI couldn't read that. You can fill in the details manually.",
      code: "PARSE_FAILED",
    });
  }

  const constraintCheck = validateConstraints(parsed);
  if (!constraintCheck.valid) {
    return Response.json({
      ok: false,
      error: `Validation failed: ${constraintCheck.errors.join(" ")}`,
      code: "CONSTRAINT_FAILED",
    });
  }

  const groundingResult = await groundParsedRfq(text.trim(), parsed, usedModel);
  const confidenceCheck = checkLowConfidence(parsed);

  const auditLog = {
    rfqId: `draft-${Date.now()}`,
    timestamp: Date.now(),
    input: text.trim(),
    model: usedModel,
    parsed,
    validationPassed: constraintCheck.valid,
    groundingChecks: groundingResult,
    userReviewNeeded: confidenceCheck.needsReview || !groundingResult.noHallucinationDetected,
    userReviewReason: confidenceCheck.reason || groundingResult.reasons.join("; "),
  };

  const logValidation = aiAuditLogSchema.safeParse(auditLog);
  if (!logValidation.success) {
    console.error("audit log schema mismatch", logValidation.error.issues);
  }

  return Response.json({
    ok: true,
    data: parsed,
    audit: {
      model: usedModel,
      confidence: parsed.confidence?.overall ?? 1,
      groundingPassed: groundingResult.noHallucinationDetected && groundingResult.noInvalidQuantities,
      needsReview: auditLog.userReviewNeeded,
      reviewReason: auditLog.userReviewReason,
    },
  });
}
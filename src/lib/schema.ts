import { z } from "zod";

export const itemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().positive().nullable(),
  unit: z.string().nullable(),
  confidence: z.number().min(0).max(1).optional(),
});

export const rfqSchema = z.object({
  items: z.array(itemSchema).min(1),
  location: z.string().nullable(),
  neededBy: z.string().nullable(),
  missing: z.array(z.string()),
  confidence: z.object({
    overall: z.number().min(0).max(1),
    location: z.number().min(0).max(1),
    neededBy: z.number().min(0).max(1),
  }).optional(),
});

export const aiAuditLogSchema = z.object({
  rfqId: z.string(),
  timestamp: z.number(),
  input: z.string(),
  model: z.string(),
  parsed: rfqSchema,
  validationPassed: z.boolean(),
  groundingChecks: z.object({
    noHallucinationDetected: z.boolean(),
    noInvalidQuantities: z.boolean(),
    noSuspiciousUnits: z.boolean(),
    reasons: z.array(z.string()),
  }),
  userReviewNeeded: z.boolean(),
  userReviewReason: z.string().optional(),
});

export type ParsedRfq = z.infer<typeof rfqSchema>;
export type RfqItem = z.infer<typeof itemSchema>;
export type AiAuditLog = z.infer<typeof aiAuditLogSchema>;
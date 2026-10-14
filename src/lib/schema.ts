import { z } from "zod";

export const itemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().positive().nullable(),
  unit: z.string().nullable(),
});

export const rfqSchema = z.object({
  items: z.array(itemSchema).min(1),
  location: z.string().nullable(),
  neededBy: z.string().nullable(),
  missing: z.array(z.string()),
});

export type ParsedRfq = z.infer<typeof rfqSchema>;
export type RfqItem = z.infer<typeof itemSchema>;
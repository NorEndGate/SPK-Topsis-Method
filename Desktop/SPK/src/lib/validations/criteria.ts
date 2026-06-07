import { z } from "zod";

export const criterionSchema = z.object({
  code: z.string().trim().min(2).max(50),
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional(),
  weight: z.coerce.number().min(1).max(5),
  attribute: z.enum(["BENEFIT", "COST"]),
  order: z.coerce.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export type CriterionInput = z.infer<typeof criterionSchema>;

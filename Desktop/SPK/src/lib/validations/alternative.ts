import { z } from "zod";

export const alternativeSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).optional(),
  imageUrl: z.string().url().nullable().optional(),
  isDemo: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export type AlternativeInput = z.infer<typeof alternativeSchema>;

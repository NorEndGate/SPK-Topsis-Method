import { z } from "zod";

export const assessmentBulkSchema = z.object({
  alternativeId: z.string().min(1),
  items: z.array(
    z.object({
      criterionId: z.string().min(1),
      score: z.coerce.number().min(1).max(5),
      note: z.string().trim().max(500).optional(),
    }),
  ),
});

export type AssessmentBulkInput = z.infer<typeof assessmentBulkSchema>;

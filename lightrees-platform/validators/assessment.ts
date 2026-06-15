import { z } from 'zod';

export const createAssessmentSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(1),
  })
  .strict();

export const updateAssessmentSchema = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
  })
  .strict();

export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>;
export type UpdateAssessmentInput = z.infer<typeof updateAssessmentSchema>;

import { z } from 'zod';

export const createQuestionSchema = z
  .object({
    text: z.string().min(1),
    orderNumber: z.number().int().nonnegative(),
    choices: z
      .array(
        z.object({
          text: z.string().min(1),
          score: z.number().int(),
        })
      )
      .min(1),
  })
  .strict();

export const updateQuestionSchema = z
  .object({
    text: z.string().min(1).optional(),
    orderNumber: z.number().int().nonnegative().optional(),
  })
  .strict();

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;

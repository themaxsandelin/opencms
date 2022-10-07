// Dependencies
import { z } from 'zod';

export const createContentBlockSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'You have to give the content block a name.'
    }),
    type: z.enum(['question', 'question-category'], {
      required_error: 'You have to give the content block a type.'
    }),
    parentIds: z.array(z.string().uuid('The parent ID have to be valid ID strings.')).optional()
  })
});

export const patchContentBlockSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'You have to give the content block a name.'
    }),
    parentIds: z.array(z.string().uuid('The parent ID have to be valid ID strings.')).optional()
  })
});

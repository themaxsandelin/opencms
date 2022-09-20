// Dependencies
import { z } from 'zod';

export const createContentBlockSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'You have to give the content block a name.'
    }),
    type: z.string({
      required_error: 'You have to give the content block a type.'
    })
  })
});

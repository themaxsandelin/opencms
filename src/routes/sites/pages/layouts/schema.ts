// Dependencies
import { z } from 'zod';

export const createLayoutSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'You need to give your layout a name.',
      invalid_type_error: 'The layout name has to be a string.'
    })
  })
});

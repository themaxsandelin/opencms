// Dependencies
import { z } from 'zod';

export const createLocaleSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'You have to give the locale a name.',
      invalid_type_error: 'The name has to be a string'
    }),
    code: z.string({
      required_error: 'You have to give the locale a code.',
      invalid_type_error: 'The code has to be a string'
    })
  })
});

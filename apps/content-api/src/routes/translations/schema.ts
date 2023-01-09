// Dependencies
import { z } from 'zod';

export const queryPagesSchema = z.object({
  query: z.object({
    locale: z.string({
      required_error: 'You have to provide a locale using the locale query parameter.',
      invalid_type_error: 'The locale query parameter has to be a string.'
    })
  })
});

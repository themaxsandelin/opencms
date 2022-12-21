// Dependencies
import { z } from 'zod';

export const searchQuerySchema = z.object({
  query: z.object({
    term: z.string({
      required_error: 'You have to provide the search term using the term query parameter.',
      invalid_type_error: 'The term query parameter has to be a string.'
    }),
  }),
});

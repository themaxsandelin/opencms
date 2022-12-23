// Dependencies
import { z } from 'zod';

export const searchQuerySchema = z.object({
  query: z.object({
    term: z.string({
      required_error: 'You have to provide the search term using the term query parameter.',
      invalid_type_error: 'The term query parameter has to be a string.'
    }),
    limit: z.string({
      invalid_type_error: 'The limit parameter has to be a string.'
    }).optional(),
    page: z.string({
      invalid_type_error: 'The page parameter has to be a string.'
    }).optional(),
  }),
});

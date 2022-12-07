// Dependencies
import { z } from 'zod';

export const getActivityLogs = z.object({
  query: z.object({
    search: z.string({
      invalid_type_error: 'The search string has to be a string.'
    }).optional(),
    page: z.string({
      invalid_type_error: 'The page number has to be a string.'
    }).optional()
  })
});

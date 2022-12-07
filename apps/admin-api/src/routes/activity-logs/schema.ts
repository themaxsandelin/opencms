// Dependencies
import { z } from 'zod';

export const getActivityLogs = z.object({
  query: z.object({
    search: z.string({
      invalid_type_error: 'The search parameter has to be a string.'
    }).optional(),
    page: z.string({
      invalid_type_error: 'The page parameter has to be a string.'
    }).optional(),
    sortBy: z.string({
      invalid_type_error: 'The sortBy parameter has to be a string.'
    }).optional(),
    sort: z.enum(['asc', 'desc'], {
      invalid_type_error: 'The sortBy parameter has to be set to either "asc" or "desc".'
    }).optional(),
  })
});

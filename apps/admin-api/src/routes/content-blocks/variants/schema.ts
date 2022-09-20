// Dependencies
import { z } from 'zod';

export const createVariantSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'You have to give the content block a name.'
    }),
    sites: z.string({
      invalid_type_error: 'The list of site IDs must be of type string.'
    }).array().optional()
  })
});

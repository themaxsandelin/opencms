// Dependencies
import { z } from 'zod';

export const createSiteSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'You have to give the site a name.',
      invalid_type_error: 'The site name has to be a string.'
    }),
    key: z.string({
      required_error: 'You have to give the site a key.',
      invalid_type_error: 'The site key has to be a string.'
    })
  })
});

export const updateSiteSchema = z.object({
  body: z.object({
    name: z.string({
      invalid_type_error: 'The site name has to be a string.'
    }).optional(),
    key: z.string({
      invalid_type_error: 'The site key has to be a string.'
    }).optional()
  })
});

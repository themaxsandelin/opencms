// Dependencies
import { z } from 'zod';

export const createSiteSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'You have to give the site a name.'
    }),
    key: z.string({
      required_error: 'You have to give the site a key.'
    })
  })
});

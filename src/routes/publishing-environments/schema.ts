// Dependencies
import { z } from 'zod';

export const createPublishingEnvironmentSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'You have to give the environment a name.'
    }),
    key: z.string({
      required_error: 'You have to give the environment a key.'
    })
  })
});

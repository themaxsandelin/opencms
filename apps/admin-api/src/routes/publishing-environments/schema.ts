// Dependencies
import { z } from 'zod';

export const createPublishingEnvironmentSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'You have to give the environment a name.',
      invalid_type_error: 'The name has to be a string'
    }),
    key: z.string({
      required_error: 'You have to give the environment a key.',
      invalid_type_error: 'The key has to be a string'
    })
  })
});

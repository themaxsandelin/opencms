// Dependencies
import { z } from 'zod';

export const publishVersionSchema = z.object({
  body: z.object({
    environment: z.string({
      required_error: 'You have to provide a publishing environment ID as a string to publish to.',
      invalid_type_error: 'The environment has to be defined by ID as a UUID string.'
    }).uuid('The environment has to be defined by ID as a UUID string.'),
  }),
});

// Dependencies
import { z } from 'zod';

export const createVersionSchema = z.object({
  body: z.object({
    content: z.object({
      blocks: z.array(
        z.string({
          invalid_type_error: 'The list of content block IDs have to be strings.'
        }).uuid({
          message: 'The content block ID has to be a valid UUID.'
        }), {
        required_error: 'You have to provide the content block IDs as an Array of Strings.'
      }).min(1, 'You have to provide at least one content block ID.')
    }, {
      required_error: 'You have to provide the content for the page layout version.',
      invalid_type_error: 'The content has to be an object.'
    })
  })
});

export const publishVersionSchema = z.object({
  body: z.object({
    environment: z.string({
      required_error: 'You have to provide a publishing environment ID as a string to publish to.',
      invalid_type_error: 'The environment has to be defined by ID as a UUID string.'
    }).uuid('The environment has to be defined by ID as a UUID string.'),
  }),
});

// Dependencies
import { z } from 'zod';

const baseBody = z.object({
  locale: z.string({
    required_error: 'You have to assign the content version a locale code.'
  })
});

export const createQuestionVersionSchema = z.object({
  body: baseBody.extend({
    content: z.object({
      question: z.string({
        required_error: 'You have to define the question.'
      }),
      answer: z.string({
        required_error: 'You have to define the answer.'
      }),
    })
  })
});

export const versionPublishSchema = z.object({
  body: z.object({
    environment: z.string({
      required_error: 'You have to provide a publishing environment ID as a string to publish to.',
      invalid_type_error: 'The environment(s) have to be defined by ID as a UUID string.'
    }).uuid('The environment(s) have to be defined by ID as a UUID string.'),
  })
});

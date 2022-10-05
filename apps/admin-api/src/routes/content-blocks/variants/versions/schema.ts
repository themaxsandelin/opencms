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
      // TODO: Fix validation of answer based on the content from the article editor. (Object -> Array of objects.)
      // answer: z.object({
      //   blocks: z.array(z.object({}))
      // }),
    })
  })
});

export const patchQuestionVersionSchema = z.object({
  body: z.object({
    content: z.object({
      question: z.string({
        required_error: 'You have to define the question.'
      }),
      // TODO: Fix validation of answer based on the content from the article editor. (Object -> Array of objects.)
      // answer: z.object({
      //   blocks: z.array(z.object({}))
      // }),
    })
  })
});

export const versionPublishSchema = z.object({
  body: z.object({
    environment: z.string({
      required_error: 'You have to provide a publishing environment ID as a string to publish to.',
      invalid_type_error: 'The environment has to be defined by ID as a UUID string.'
    }).uuid('The environment has to be defined by ID as a UUID string.'),
  })
});

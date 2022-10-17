// Dependencies
import { z } from 'zod';

const baseBody = z.object({
  locale: z.string({
    required_error: 'You have to assign the content version a locale code.'
  }),
  slug: z.string({
    invalid_type_error: 'The slug has to be a string.'
  }).regex(/^\/([a-z0-9]?)+(?:-[a-z0-9]+)*$/gm, 'The slug must be in the format /like-a-slug.').optional()
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

export const createQuestionCategoryVersionSchema = z.object({
  body: baseBody.extend({
    content: z.object({
      name: z.string({
        required_error: 'You have to give the category a name.'
      })
    })
  })
});

export const patchQuestionCategoryVersionSchema = z.object({
  body: z.object({
    slug: z.string({
      invalid_type_error: 'The slug has to be a string.'
    }).regex(/^\/([a-z0-9]?)+(?:-[a-z0-9]+)*$/gm, 'The slug must be in the format /like-a-slug.').optional(),
    content: z.object({
      name: z.string({
        required_error: 'You have to give the category a name.'
      })
    })
  })
});

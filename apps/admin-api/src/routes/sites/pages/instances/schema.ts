// Dependencies
import { z } from 'zod';

export const createInstanceSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: 'You have to give the page instance a title.',
      invalid_type_error: 'The page instance title has to be a string.'
    }),
    description: z.string({
      invalid_type_error: 'The page instance description has to be a string.'
    }).optional(),
    slug: z.string({
      required_error: 'You have to give the page instance a slug.',
      invalid_type_error: 'The page instance slug has to be a string.'
    }).regex(/^\/((\*?)|([a-z0-9]*)|(([a-z0-9]?)+(?:-[a-z0-9]+))*){1}$/gm, 'The slug must be in the format /like-a-slug.'),
    localeCode: z.string({
      required_error: 'You have to assign the page instance a localeCode.',
      invalid_type_error: 'The page instance localeCode has to be a string.'
    })
  })
});

export const updateInstanceSchema = z.object({
  body: z.object({
    title: z.string({
      invalid_type_error: 'The page instance title has to be a string.'
    }).optional(),
    description: z.string({
      invalid_type_error: 'The page instance description has to be a string.'
    }).optional(),
    slug: z.string({
      invalid_type_error: 'The page instance slug has to be a string.'
    }).regex(/^\/((\*?)|([a-z0-9]*)|(([a-z0-9]?)+(?:-[a-z0-9]+))*){1}$/gm, 'The slug must be in the format /like-a-slug.').optional()
  })
});

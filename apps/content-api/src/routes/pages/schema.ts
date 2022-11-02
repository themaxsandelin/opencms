// Dependencies
import { z } from 'zod';

export const queryPagesSchema = z.object({
  query: z.object({
    slug: z.string({
      invalid_type_error: 'The slug query parameter has to be a string.'
    }).regex(/^\/((\*?)|([a-z0-9]*)|(([a-z0-9]?)+(?:-[a-z0-9]+))*){1}$/gm, 'The slug must be in the format /like-a-slug.').optional(),
    path: z.string({
      invalid_type_error: 'The path query parameter has to be a string.'
    }).optional(),
    locale: z.string({
      invalid_type_error: 'The locale query parameter has to be a string.'
    }).optional(),
    site: z.string({
      required_error: 'You have to provide the site key using the site query parameter.',
      invalid_type_error: 'The site query parameter has to be a string.'
    })
  })
});

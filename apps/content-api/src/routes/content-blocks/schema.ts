// Dependencies
import { z } from 'zod';

export const queryContentBlockSchema = z.object({
  query: z.object({
    type: z.string({
      required_error: 'You have to provide the content block type using the type query parameter.',
      invalid_type_error: 'The type query parameter has to be a string.'
    }),
    environment: z.string({
      required_error: 'You have to provide the publishing environment using the environment query parameter.',
      invalid_type_error: 'The environment query parameter has to be a string.'
    }),
    locale: z.string({
      required_error: 'You have to provide the locale code (ex. sv-SE) using the locale query parameter.',
      invalid_type_error: 'The locale query parameter has to be a string.'
    }),
    site: z.string({
      required_error: 'You have to provide the site key using the site query parameter.',
      invalid_type_error: 'The site query parameter has to be a string.'
    }),
    parentSlug: z.string({
      invalid_type_error: 'The parentSlug parameter has to be a string.'
    }).regex(/^\/((\*?)|([a-z0-9]*)|(([a-z0-9]?)+(?:-[a-z0-9]+))*){1}$/gm, 'The parentSlug must be in the format /like-a-slug.').optional(),
    siblingSlug: z.string({
      invalid_type_error: 'The siblingSlug parameter has to be a string.'
    }).regex(/^\/((\*?)|([a-z0-9]*)|(([a-z0-9]?)+(?:-[a-z0-9]+))*){1}$/gm, 'The parentSlug must be in the format /like-a-slug.').optional(),
    limit: z.string({
      invalid_type_error: 'The limit parameter has to be a string.'
    }).optional(),
    page: z.string({
      invalid_type_error: 'The page parameter has to be a string.'
    }).optional(),
  }),
});

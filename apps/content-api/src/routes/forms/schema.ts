// Dependencies
import { z } from 'zod';

export const formSubmissionSchema = z.object({
  query: z.object({
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
    pagePath: z.string({
      required_error: 'You have to provide the page path using the pagePath query parameter.',
      invalid_type_error: 'The pagePath query parameter has to be a string.'
    }),
  })
});

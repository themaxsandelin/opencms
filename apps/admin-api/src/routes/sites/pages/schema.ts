// Dependencies
import { z } from 'zod';

export const createPageSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: 'You have to give the page a title.'
    }),
    slug: z.string({
      required_error: 'You have to give the site a slug.',
    }).regex(/^\/((\*?)|([a-z0-9]*)|(([a-z0-9]?)+(?:-[a-z0-9]+))*){1}$/gm, 'The slug must be in the format "/like-a-slug".'),
    parentId: z.string().uuid({ message: 'The parent ID has to be defined as a valid ID.' }).optional()
  })
});

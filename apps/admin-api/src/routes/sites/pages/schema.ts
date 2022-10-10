// Dependencies
import { z } from 'zod';

export const createPageSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'You have to give the page a name.'
    }),
    isFrontPage: z.boolean({
      invalid_type_error: 'The parameter isFrontPage has to be a boolean.'
    }).optional(),
    parentId: z.string().uuid({ message: 'The parent ID has to be defined as a valid ID.' }).optional()
  })
});

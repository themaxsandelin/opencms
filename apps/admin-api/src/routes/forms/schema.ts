// Dependencies
import { z } from 'zod';

export const createFormSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'You have to give the form a name.',
      invalid_type_error: 'The form name has to be a string.'
    })
  })
});

export const patchFormSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'You have to give the form a name.',
      invalid_type_error: 'The form name has to be a string.'
    })
  })
});

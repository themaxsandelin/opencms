// Dependencies
import { z } from 'zod';

export const createInstanceLayoutSchema = z.object({
  body: z.object({
    layoutId: z.string().uuid({ message: 'The layout ID has to be defined as a valid ID.' }),
    publishingEnvironmentId: z.string().uuid({ message: 'The layout ID has to be defined as a valid ID.' })
  })
});

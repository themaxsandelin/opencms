// Dependencies
import { Router, Request, Response } from 'express';

// Locales
import { locales } from '@open-cms/utils';

const router = Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
  res.json(locales);
});

export default router;

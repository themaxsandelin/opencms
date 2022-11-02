// Dependencies
import { Router, Request, Response } from 'express';

// Locales
import locales from '@open-cms/shared/locales';

const router = Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
  res.json({
    data: locales
  });
});

export default router;

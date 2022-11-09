// Dependencies
import { Router, Request, Response } from 'express';

// Routers
import LocalesRouter from './locales';
import SitesRouter from './sites';
import PublishingEnvironmentsRouter from './publishing-environments';
import ContentBlocksRouter from './content-blocks';
import FormsRouter from './forms';

const router = Router();
router.use('/locales', LocalesRouter);
router.use('/sites', SitesRouter);
router.use('/publishing-environments', PublishingEnvironmentsRouter);
router.use('/content-blocks', ContentBlocksRouter);
router.use('/forms', FormsRouter);

router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Do, or do not. There is no try.' });
});

export default router;

// Dependencies
import { Router, Request, Response } from 'express';

// Routers
import SitesRouter from './sites';
import PublishingEnvironmentsRouter from './publishing-environments';
import ContentBlocksRouter from './content-blocks';

const router = Router();
router.use('/sites', SitesRouter);
router.use('/publishing-environments', PublishingEnvironmentsRouter);
router.use('/content-blocks', ContentBlocksRouter);

router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Do, or do not. There is no try.' });
});

export default router;

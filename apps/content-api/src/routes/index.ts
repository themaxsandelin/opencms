// Dependencies
import { Router, Request, Response } from 'express';

// Routers
import ContentRouter from './content';
import ContentBlocksRouter from './content-blocks';
import PagesRouter from './pages';
import FormsRouter from './forms';
import SearchRouter from './search';
import TranslationsRouter from './translations';

const router = Router();
router.use('/content', ContentRouter);
router.use('/content-blocks', ContentBlocksRouter);
router.use('/pages', PagesRouter);
router.use('/forms', FormsRouter);
router.use('/search', SearchRouter);
router.use('/translations', TranslationsRouter);

router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'In my experience, there\'s no such thing as luck.' });
});

export default router;

// Dependencies
import { Router, Request, Response } from 'express';

// Routers
import ContentRouter from './content';
import ContentBlocksRouter from './content-blocks';

const router = Router();
router.use('/content', ContentRouter);
router.use('/content-blocks', ContentBlocksRouter);

router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'In my experience, there\'s no such thing as luck.' });
});

export default router;

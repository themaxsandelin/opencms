// Dependencies
import { Router, Request, Response } from 'express';

// Routers
import ContentRouter from './content';

const router = Router();
router.use('/content', ContentRouter);

router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'In my experience, there\'s no such thing as luck.' });
});

export default router;

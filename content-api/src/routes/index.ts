// Dependencies
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'In my experience, there\'s no such thing as luck.' });
});

export default router;

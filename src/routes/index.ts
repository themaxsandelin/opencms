// Dependencies
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Do, or do not. There is no try.' });
});

export default router;

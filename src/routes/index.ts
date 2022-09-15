// Dependencies
import { Router, Request, Response } from 'express';

// Routes
import SitesRouter from './sites';

const router = Router();
router.use('/sites', SitesRouter);

router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Do, or do not. There is no try.' });
});

export default router;

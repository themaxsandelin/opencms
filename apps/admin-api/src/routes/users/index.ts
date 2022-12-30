// Dependencies
import { Router, Request, Response } from 'express';

// Utils
import logger from '../../utils/logger';

const router = Router();

router.get('/me', async (req: Request, res: Response) => {
  try {
    const { adUsername, firstName, lastName } = req.body.user;
    res.json({ data: { adUsername, firstName, lastName } });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

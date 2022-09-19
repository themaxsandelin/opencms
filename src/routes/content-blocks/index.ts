// Dependencies
import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

// Routers
import VariantRouter from './variants';

// Utils
import { validateRequest } from '@/utils/validation';

// Data schema
import { createContentBlockSchema } from './schema';

const prisma = new PrismaClient();
const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const contentBlocks = await prisma.contentBlock.findMany();
    return res.json(contentBlocks);
  } catch (error) {
    res.status(500).json({ error: JSON.stringify(error) });
  }
});

router.post('/', validateRequest(createContentBlockSchema), async (req: Request, res: Response) => {
  try {
    const { name, type } = req.body;
    const contentBlock = await prisma.contentBlock.create({
      data: {
        name,
        type
      }
    });
    return res.json(contentBlock);
  } catch (error) {
    res.status(500).json({ error: JSON.stringify(error) });
  }
});

router.use('/:blockId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contentBlock = await prisma.contentBlock.findFirst({
      where: {
        id: req.params.blockId
      }
    });
    if (!contentBlock) {
      return res.status(404).json({ error: 'No content block found.' });
    }

    req.body.contentBlock = contentBlock;
    next();
  } catch (error) {
    res.status(500).json({ error: JSON.stringify(error) });
  }
});
router.use('/:blockId/variants', VariantRouter);

export default router;

// Dependencies
import { Router, Request, Response, NextFunction } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';

// Utils
import { validateRequest } from '@open-cms/utils';

// Validation schemas
import { createPublishingEnvironmentSchema } from './schema';

const prisma = new PrismaClient();
const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const publishingEnvironments = await prisma.publishingEnvironment.findMany();
    res.json(publishingEnvironments);
  } catch (error) {
    res.status(500).json({
      error: (error as any).message,
    });
  }
});

router.post('/', validateRequest(createPublishingEnvironmentSchema), async (req: Request, res: Response) => {
  try {
    const { name, key } = req.body;

    const publishingEnvironment = await prisma.publishingEnvironment.create({
      data: {
        name,
        key
      }
    });

    res.json(publishingEnvironment);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'The key is already being used by a different environment.' });
      }
    }
    res.status(500).json({ error: JSON.stringify(error) });
  }
});

router.use('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const publishingEnvironment = await prisma.publishingEnvironment.findFirst({
      where: {
        id: req.params.id
      }
    });
    if (!publishingEnvironment) {
      return res.status(404).json({ error: 'Publishing environment not found.' });
    }

    req.body.publishingEnvironment = publishingEnvironment;
    next();
  } catch (error) {
    res.status(500).json({ error: JSON.stringify(error) });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  res.json(req.body.publishingEnvironment);
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.publishingEnvironment.delete({
      where: {
        id: req.body.publishingEnvironment.id
      }
    });
    res.json({ deleted: true });
  } catch (error) {
    res.status(500).json({ error: JSON.stringify(error) });
  }
});

export default router;

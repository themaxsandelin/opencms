// Dependencies
import { Router, Request, Response, NextFunction } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';

// Utils
import { validateRequest } from '@open-cms/shared/utils';

// Validation schemas
import { createPublishingEnvironmentSchema } from './schema';

const prisma = new PrismaClient();
const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const publishingEnvironments = await prisma.publishingEnvironment.findMany();
    res.json({ data: publishingEnvironments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
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

    res.json({ data: publishingEnvironment });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'The key is already being used by a different environment.' });
      }
    }
    console.error(error);
    res.status(500).json({ error: error.message });
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
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { publishingEnvironment } = req.body;
    res.json({ data: publishingEnvironment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.publishingEnvironment.delete({
      where: {
        id: req.body.publishingEnvironment.id
      }
    });
    res.json({ data: { deleted: true } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

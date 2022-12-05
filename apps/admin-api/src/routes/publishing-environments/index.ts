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
    const publishingEnvironments = await prisma.publishingEnvironment.findMany({
      include: {
        createdBy: true,
        updatedBy: true,
      }
    });
    res.json({ data: publishingEnvironments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', validateRequest(createPublishingEnvironmentSchema), async (req: Request, res: Response) => {
  try {
    const { name, key, user } = req.body;

    const publishingEnvironment = await prisma.publishingEnvironment.create({
      data: {
        name,
        key,
        createdByUserId: user.id,
        updatedByUserId: user.id,
      }
    });

    // Log publishing environment creation.
    await prisma.activityLog.create({
      data: {
        action: 'create',
        resourceType: 'publishingEnvironment',
        resourceId: publishingEnvironment.id,
        createdByUserId: user.id
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

export default router;

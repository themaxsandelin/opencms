// Dependencies
import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

// Routers
import VersionsRouter from './versions';

// Utils
import { validateRequest } from '@open-cms/utils';

// Validation schema
import { createLayoutSchema } from './schema';

const prisma = new PrismaClient();
const router = Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response) => {
  try {
    const { page } = req.body;
    const layouts = await prisma.pageLayout.findMany({
      where: {
        pageId: page.id
      }
    });

    res.json({ data: layouts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: JSON.stringify(error) });
  }
});

router.post('/', validateRequest(createLayoutSchema), async (req: Request, res: Response) => {
  try {
    const { name, page } = req.body;

    const pageLayout = await prisma.pageLayout.create({
      data: {
        name,
        pageId: page.id
      }
    });

    res.json({ data: pageLayout });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: JSON.stringify(error) });
  }
});

router.use('/:layoutId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { layoutId } = req.params;
    const pageLayout = await prisma.pageLayout.findFirst({
      where: {
        id: layoutId
      }
    });
    if (!pageLayout) {
      return res.status(404).json({ error: `Could not find a page layout with the ID ${layoutId}` });
    }

    req.body.pageLayout = pageLayout;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: JSON.stringify(error) });
  }
});

router.get('/:layoutId', async (req: Request, res: Response) => {
  try {
    const { pageLayout } = req.body;
    res.json({ data: pageLayout });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: JSON.stringify(error) });
  }
});

router.use('/:layoutId/versions', VersionsRouter);

export default router;

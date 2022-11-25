// Dependencies
import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

// Routers
import VersionsRouter from './versions';

// Controller
import { deletePageLayout } from './controller';

// Utils
import { validateRequest } from '@open-cms/shared/utils';

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
    res.status(500).json({ error: error.message });
  }
});

router.post('/', validateRequest(createLayoutSchema), async (req: Request, res: Response) => {
  try {
    const { name, page, user } = req.body;

    const pageLayout = await prisma.pageLayout.create({
      data: {
        name,
        pageId: page.id,
        createdByUserId: user.id,
        updatedByUserId: user.id,
      }
    });

    res.json({ data: pageLayout });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
});

router.get('/:layoutId', async (req: Request, res: Response) => {
  try {
    const { pageLayout } = req.body;
    res.json({ data: pageLayout });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:layoutId', async (req: Request, res: Response) => {
  try {
    const { pageLayout } = req.body;
    await deletePageLayout(pageLayout);

    res.json({ data: { deleted: true } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.use('/:layoutId/versions', VersionsRouter);

export default router;

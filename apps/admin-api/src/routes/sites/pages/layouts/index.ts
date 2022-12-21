// Dependencies
import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

// Routers
import VersionsRouter from './versions';

// Utils
import { validateRequest } from '@open-cms/shared/utils';
import { deletePageInstanceLayoutByPageLayoutId } from '../instances/layouts/controller';

// Validation schema
import { createLayoutSchema, updateLayoutSchema } from './schema';

const prisma = new PrismaClient();
const router = Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response) => {
  try {
    const { page } = req.body;
    const layouts = await prisma.pageLayout.findMany({
      where: {
        pageId: page.id,
        deleted: false,
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

    // Log page update.
    await prisma.activityLog.create({
      data: {
        action: 'create',
        resourceType: 'pageLayout',
        resourceId: pageLayout.id,
        createdByUserId: user.id
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
        id: layoutId,
        deleted: false
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

router.patch('/:layoutId', validateRequest(updateLayoutSchema), async (req: Request, res: Response) => {
  try {
    const { name, pageLayout, user } = req.body;
    if (!name) {
      return res.json({ data: { updated: false } });
    }

    await prisma.pageLayout.update({
      data: {
        name
      },
      where: {
        id: pageLayout.id
      }
    });

    // Log page layout update.
    await prisma.activityLog.create({
      data: {
        action: 'update',
        resourceType: 'pageLayout',
        resourceId: pageLayout.id,
        createdByUserId: user.id
      }
    });

    res.json({ data: { updated: true } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:layoutId', async (req: Request, res: Response) => {
  try {
    const { pageLayout, user } = req.body;

    await prisma.pageLayout.update({
      data: {
        deleted: true
      },
      where: {
        id: pageLayout.id
      }
    });

    await deletePageInstanceLayoutByPageLayoutId(pageLayout.id, user.id);

    // Log page layout deletion.
    await prisma.activityLog.create({
      data: {
        action: 'delete',
        resourceType: 'pageLayout',
        resourceId: pageLayout.id,
        createdByUserId: user.id
      }
    });

    res.json({ data: { deleted: true } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.use('/:layoutId/versions', VersionsRouter);

export default router;

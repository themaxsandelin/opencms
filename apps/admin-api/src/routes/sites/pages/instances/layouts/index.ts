// Dependencies
import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

// Utils
import { validateRequest } from '@open-cms/utils';

// Schemas
import { createInstanceLayoutSchema } from './schema';

const prisma = new PrismaClient();
const router = Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response) => {
  try {
    const { instanceId } = req.params;
    const pageInstanceLayouts = await prisma.pageInstanceLayout.findMany({
      where: {
        pageInstanceId: instanceId
      }
    });

    res.json({ data: pageInstanceLayouts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', validateRequest(createInstanceLayoutSchema), async (req: Request, res: Response) => {
  try {
    const { layoutId, publishingEnvironmentId, pageInstance } = req.body;

    const environment = await prisma.publishingEnvironment.findFirst({
      where: {
        id: publishingEnvironmentId
      }
    });
    if (!environment) {
      return res.status(400).json({ error: `Could not find a publishing environment by id ${publishingEnvironmentId}.` });
    }

    const layout = await prisma.pageLayout.findFirst({
      where: {
        id: layoutId,
        pageId: pageInstance.pageId
      }
    });
    if (!layout) {
      return res.status(400).json({ error: `Could not find a page layout by the ID ${layoutId} on this page.` });
    }

    const existingPageInstanceLayout = await prisma.pageInstanceLayout.findFirst({
      where: {
        pageInstanceId: pageInstance.id,
        pageLayoutId: layout.id,
        publishingEnvironmentId: environment.id
      }
    });
    if (existingPageInstanceLayout) {
      return res.status(400).json({ error: 'This layout has already been published on this environment, for this page instance.' });
    }

    const pageInstanceLayout = await prisma.pageInstanceLayout.create({
      data: {
        pageInstanceId: pageInstance.id,
        pageLayoutId: layout.id,
        publishingEnvironmentId: environment.id
      }
    });

    res.json({ data: pageInstanceLayout });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.use('/:pageInstanceLayoutId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageInstanceLayoutId } = req.params;

    const pageInstanceLayout = await prisma.pageInstanceLayout.findFirst({
      where: {
        id: pageInstanceLayoutId
      }
    });
    if (!pageInstanceLayout) {
      return res.status(404).json({ error: 'Could not find page instance layout.' });
    }

    req.body.pageInstanceLayout = pageInstanceLayout;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:pageInstanceLayoutId', async (req: Request, res: Response) => {
  try {
    const { pageInstanceLayoutId } = req.params;

    await prisma.pageInstanceLayout.delete({
      where: {
        id: pageInstanceLayoutId
      }
    });

    res.json({ data: { deleted: true } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

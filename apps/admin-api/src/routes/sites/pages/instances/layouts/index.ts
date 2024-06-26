// Dependencies
import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

// Shared
import { validateRequest } from '@open-cms/shared/utils';

// Utils
import logger from '../../../../../utils/logger';

// Schemas
import { createInstanceLayoutSchema } from './schema';

const prisma = new PrismaClient();
const router = Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response) => {
  try {
    const { instanceId } = req.params;
    const pageInstanceLayouts = await prisma.pageInstanceLayout.findMany({
      where: {
        pageInstanceId: instanceId,
      }
    });

    res.json({ data: pageInstanceLayouts });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', validateRequest(createInstanceLayoutSchema, logger), async (req: Request, res: Response) => {
  try {
    const { layoutId, publishingEnvironmentId, pageInstance, user } = req.body;

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
        pageId: pageInstance.pageId,
        deleted: false
      }
    });
    if (!layout) {
      return res.status(400).json({ error: `Could not find a page layout by the ID ${layoutId} on this page.` });
    }

    // Delete existing page instance layout connections.
    const existingPageInstanceLayouts = await prisma.pageInstanceLayout.findMany({
      where: {
        pageInstanceId: pageInstance.id,
        publishingEnvironmentId: environment.id
      }
    });
    await Promise.all(
      existingPageInstanceLayouts.map(async (pageInstanceLayout) => prisma.pageInstanceLayout.delete({
        where: {
          id: pageInstanceLayout.id
        }
      }))
    );

    const pageInstanceLayout = await prisma.pageInstanceLayout.create({
      data: {
        pageInstanceId: pageInstance.id,
        pageLayoutId: layout.id,
        publishingEnvironmentId: environment.id,
        createdByUserId: user.id,
        updatedByUserId: user.id,
      }
    });

    // Log page instance layout creation.
    await prisma.activityLog.create({
      data: {
        action: 'create',
        resourceType: 'pageInstanceLayout',
        resourceId: pageInstanceLayout.id,
        createdByUserId: user.id
      }
    });

    res.json({ data: pageInstanceLayout });
  } catch (error) {
    logger.error(error);
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
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

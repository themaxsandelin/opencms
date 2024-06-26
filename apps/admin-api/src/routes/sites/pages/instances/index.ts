// Dependencies
import { Router, Request, Response, NextFunction } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';

// Routers
import LayoutsRouter from './layouts';

// Controller
import { updateAllChildPagesInstancePaths } from './controller';
import { deletePageInstanceLayoutByPageInstanceId } from './layouts/controller';

// Utils
import logger from '../../../../utils/logger';
import { validateRequest } from '@open-cms/shared/utils';

// Schemas
import { createInstanceSchema, updateInstanceSchema } from './schema';

const prisma = new PrismaClient();
const router = Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response) => {
  try {
    const { pageId } = req.params;

    const instances = await prisma.pageInstance.findMany({
      where: {
        pageId,
        deleted: false
      },
      include: {
        createdBy: true,
        updatedBy: true
      }
    });

    res.json({ data: instances });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', validateRequest(createInstanceSchema, logger), async (req: Request, res: Response) => {
  try {
    const { page, title, description, slug, localeCode, user } = req.body;

    const locale = await prisma.locale.findFirst({
      where: {
        code: localeCode
      }
    });
    if (!locale) {
      return res.status(400).json({ error: `The locale code ${localeCode} does not exist in the system.` });
    }

    const existingInstance = await prisma.pageInstance.findFirst({
      where: {
        localeCode,
        pageId: page.id,
        deleted: false,
      }
    });
    if (existingInstance) {
      return res.status(400).json({ error: `There already exists a page instance with the locale code ${localeCode}.` });
    }

    const givenSlug = page.isFrontPage ? '/' : slug;
    let givenPath = givenSlug;
    if (!page.isFrontPage && page.parentId) {
      const parent = await prisma.pageInstance.findFirst({
        where: {
          pageId: page.parentId,
          localeCode,
          deleted: false
        },
        select: {
          path: true
        }
      });
      if (parent) {
        givenPath = `${parent.path}${slug}`;
      } else {
        givenPath = '';
      }
    }

    const instance = await prisma.pageInstance.create({
      data: {
        title,
        description: description || '',
        slug: givenSlug,
        path: givenPath,
        localeCode,
        pageId: page.id,
        createdByUserId: user.id,
        updatedByUserId: user.id,
      }
    });

    // Log page instance creation.
    await prisma.activityLog.create({
      data: {
        action: 'create',
        resourceType: 'pageInstance',
        resourceId: instance.id,
        createdByUserId: user.id
      }
    });

    res.status(201).json({ data: instance });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.use('/:instanceId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { instanceId, pageId } = req.params;

    const instance = await prisma.pageInstance.findFirst({
      where: {
        id: instanceId,
        pageId,
        deleted: false
      }
    });
    if (!instance) {
      return res.status(404).json({ error: 'Page instance not found.' });
    }

    req.body.pageInstance = instance;
    next();
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:instanceId', (req: Request, res: Response) => {
  try {
    const { pageInstance } = req.body;

    res.json({
      data: {
        ...pageInstance,
        config: pageInstance.config ? JSON.parse(pageInstance.config) : {}
      }
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:instanceId', validateRequest(updateInstanceSchema, logger), async (req: Request, res: Response) => {
  try {
    const { title, description, slug, page, pageInstance, config, user } = req.body;

    const updateQuery: Prisma.PageInstanceUpdateArgs = {
      data: {
        updatedByUserId: user.id
      },
      where: {
        id: pageInstance.id
      }
    };
    if (title) {
      updateQuery.data.title = title;
    }
    if (description) {
      updateQuery.data.description = description;
    }
    if (config) {
      updateQuery.data.config = JSON.stringify(config);
    }

    if (!page.isFrontPage && slug) {
      let givenPath = slug;
      if (page.parentId) {
        const parent = await prisma.pageInstance.findFirst({
          where: {
            pageId: page.parentId,
            localeCode: pageInstance.localeCode,
            deleted: false
          },
          select: {
            path: true
          }
        });
        if (parent) {
          givenPath = `${parent.path}${slug}`;
        }
      }
      updateQuery.data.slug = slug;
      updateQuery.data.path = givenPath;

      await updateAllChildPagesInstancePaths(page.id, pageInstance.localeCode, givenPath, user.id);
    }

    await prisma.pageInstance.update(updateQuery);

    // Log page instance update.
    await prisma.activityLog.create({
      data: {
        action: 'update',
        resourceType: 'pageInstance',
        resourceId: pageInstance.id,
        createdByUserId: user.id
      }
    });

    res.json({ data: { updated: true } });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:instanceId', async (req: Request, res: Response) => {
  try {
    const { pageInstance, user } = req.body;

    await prisma.pageInstance.update({
      data: {
        deleted: true
      },
      where: {
        id: pageInstance.id
      }
    });

    await deletePageInstanceLayoutByPageInstanceId(pageInstance.id, user.id);

    // Log page instance delete.
    await prisma.activityLog.create({
      data: {
        action: 'delete',
        resourceType: 'pageInstance',
        resourceId: pageInstance.id,
        createdByUserId: user.id
      }
    });

    res.json({ data: { deleted: true } });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.use('/:instanceId/layouts', LayoutsRouter);

export default router;

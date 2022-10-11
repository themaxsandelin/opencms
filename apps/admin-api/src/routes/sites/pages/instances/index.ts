// Dependencies
import { Router, Request, Response, NextFunction } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';

// Routers
import LayoutsRouter from './layouts';

// Controller
import { updateAllChildPagesInstancePaths, deletePageInstance } from './controller';

// Utils
import { validateRequest } from '@open-cms/utils';
import { locales } from '@open-cms/utils';

// Schemas
import { createInstanceSchema, updateInstanceSchema } from './schema';

const prisma = new PrismaClient();
const router = Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response) => {
  try {
    const { pageId } = req.params;

    const instances = await prisma.pageInstance.findMany({
      where: {
        pageId
      }
    });

    res.json({ data: instances });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', validateRequest(createInstanceSchema), async (req: Request, res: Response) => {
  try {
    const { page, title, description, slug, localeCode } = req.body;

    const foundLocale = locales.find(locale => locale.code === localeCode);
    if (!foundLocale) {
      return res.status(400).json({ error: `The locale code ${localeCode} does not exist in the system.` });
    }

    const existingInstance = await prisma.pageInstance.findFirst({
      where: {
        localeCode,
        pageId: page.id
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
          localeCode
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

    if (givenPath) {
      await updateAllChildPagesInstancePaths(page.id, localeCode, givenPath);
    }

    const instance = await prisma.pageInstance.create({
      data: {
        title,
        description: description || '',
        slug: givenSlug,
        path: givenPath,
        localeCode,
        pageId: page.id
      }
    });

    res.status(201).json({ data: instance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.use('/:instanceId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { instanceId, pageId } = req.params;

    const instance = await prisma.pageInstance.findFirst({
      where: {
        id: instanceId,
        pageId
      }
    });
    if (!instance) {
      return res.status(404).json({ error: 'Page instance not found.' });
    }

    req.body.pageInstance = instance;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:instanceId', (req: Request, res: Response) => {
  try {
    const { pageInstance } = req.body;

    res.json({ data: pageInstance });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:instanceId', validateRequest(updateInstanceSchema), async (req: Request, res: Response) => {
  try {
    const { title, description, slug, page, pageInstance } = req.body;

    const updateQuery: Prisma.PageInstanceUpdateArgs = {
      data: {},
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

    if (!page.isFrontPage && slug) {
      let givenPath = slug;
      if (page.parentId) {
        const parent = await prisma.pageInstance.findFirst({
          where: {
            pageId: page.parentId,
            localeCode: pageInstance.localeCode
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

      await updateAllChildPagesInstancePaths(page.id, pageInstance.localeCode, givenPath);
    }

    await prisma.pageInstance.update(updateQuery);

    res.json({ data: { updated: true } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:instanceId', async (req: Request, res: Response) => {
  try {
    const { page, pageInstance } = req.body;
    await deletePageInstance(page, pageInstance);

    res.json({ data: { deleted: true } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.use('/:instanceId/layouts', LayoutsRouter);

export default router;
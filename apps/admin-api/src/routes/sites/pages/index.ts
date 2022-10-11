// Dependencies
import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

// Routers
import LayoutRouter from './layouts';
import InstancesRouter from './instances';

// Controller
import { deletePage } from './controller';

// Utils
import { validateRequest } from '@open-cms/utils';

// Schemas
import { createPageSchema } from './schema';

const prisma = new PrismaClient();
const router = Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response) => {
  try {
    const { search } = req.query;
    const { siteId } = req.params;

    const pages = await prisma.page.findMany({
      where: {
        siteId,
        name: search ? {
          contains: (search as string)
        } : {
          not: ''
        }
      }
    });

    res.json({ data: pages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', validateRequest(createPageSchema), async (req: Request, res: Response) => {
  try {
    const { name, isFrontPage, parentId } = req.body;
    const { siteId } = req.params;

    if (isFrontPage) {
      const existingFrontPage = await prisma.page.findFirst({
        where: {
          isFrontPage: true,
          siteId
        }
      });
      if (existingFrontPage) {
        return res.status(400).json({ error: 'There already exists a front page for this site.' });
      }
    }

    let parent;
    if (parentId) {
      parent = await prisma.page.findFirst({
        where: {
          id: parentId
        }
      });
      if (!parent) {
        return res.status(400).json({ error: `Could not find a page based on the parentId ${parentId}` });
      }
      if (parent.isFrontPage) {
        return res.status(400).json({ error: 'The targeted parent page is the site front page. You cannot assign a child to a site front page.' });
      }
    }

    const page = await prisma.page.create({
      data: {
        name,
        isFrontPage,
        siteId,
        parentId: parent ? parent.id : null
      }
    });

    res.status(201).json({ data: page });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.use('/:pageId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageId } = req.params;
    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
      }
    });
    if (!page) {
      return res.status(404).json({ error: 'Page not found.' });
    }

    req.body.page = page;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:pageId', async (req: Request, res: Response) => {
  try {
    const { page } = req.body;

    return res.json({ data: page });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:pageId', async (req: Request, res: Response) => {
  try {
    const { page } = req.body;
    await deletePage(page);

    return res.json({ data: { deleted: true } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.use('/:pageId/layouts', LayoutRouter);
router.use('/:pageId/instances', InstancesRouter);

export default router;

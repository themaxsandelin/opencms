// Dependencies
import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

// Routers
import LayoutRouter from './layouts';

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
    let query;
    if (req.query.all) {
      query = {
        where: {
          siteId: req.body.site.id,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          parentId: true
        }
      }
    } else {
      query = {
        where: {
          siteId: req.body.site.id,
          parentId: null,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          children: {
            select: {
              id: true,
              title: true,
              slug: true,
            }
          }
        }
      };
    }
    const pages = await prisma.page.findMany(query);
    res.json(pages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: JSON.stringify(error) });
  }
});

router.post('/', validateRequest(createPageSchema), async (req: Request, res: Response) => {
  try {
    const { title, slug, parentId } = req.body;

    const existingPageBySlug = await prisma.page.findFirst({
      where: {
        slug,
        siteId: req.body.site.id
      }
    });
    if (existingPageBySlug) {
      return res.status(400).json({ error: `There already is a page on this site with the slug ${slug}.` });
    }

    let parentPage;
    if (parentId) {
      parentPage = await prisma.page.findFirst({
        where: {
          id: parentId
        }
      });
      if (!parentPage) {
        return res.status(400).json({ error: `Could not find a page by parentId ${parentId}.` });
      }
      // Make sure you can't create a child page with the slug "/"
      if (slug === '/') {
        return res.status(400).json({ error: 'You cannot use the root slug (\'/\') as a slug for a page with a parent.' });
      }
      // Make sure you can't create a child page for the root page (page with the slug "/")
      if (parentPage.slug === '/') {
        return res.status(400).json({ error: 'You cannot assign a page to be a child of a page with the slug \'/\'.' });
      }
    }

    const page = await prisma.page.create({
      data: {
        title,
        slug,
        siteId: req.body.site.id,
        parentId: parentPage ? parentPage.id : null
      }
    });
    res.json(page);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: JSON.stringify(error) });
  }
});

router.use('/:pageId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pageId } = req.params;
    const page = await prisma.page.findFirst({
      where: {
        id: pageId,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        children: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    });
    if (!page) {
      return res.status(404).json({ error: 'Page not found.' });
    }

    req.body.page = page;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: JSON.stringify(error) });
  }
});

router.get('/:pageId', async (req: Request, res: Response) => {
  try {
    const { page } = req.body;

    return res.json(page);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: JSON.stringify(error) });
  }
});

router.delete('/:pageId', async (req: Request, res: Response) => {
  try {
    const { deleteChildren } = req.query;
    const { page } = req.body;

    await deletePage(page, page, (deleteChildren ? true : false));

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: JSON.stringify(error) });
  }
});

router.use('/:pageId/layouts', LayoutRouter);

export default router;

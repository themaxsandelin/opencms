// Dependencies
import { Router, Request, Response, NextFunction } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';

// Routers
import LayoutRouter from './layouts';
import InstancesRouter from './instances';

// Controllers
import { deletePage, pageInstanceSlugsAreUniqueOnParentPage } from './controller';
import { updateAllPageInstancePaths } from './instances/controller';

// Utils
import { validateRequest } from '@open-cms/utils';

// Schemas
import { createPageSchema, patchPageSchema } from './schema';

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
      },
      include: {
        parent: true
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

router.patch('/:pageId', validateRequest(patchPageSchema), async (req: Request, res: Response) => {
  try {
    const { name, isFrontPage, parentId, page } = req.body;

    let changeOfFrontpage = false;
    let changeOfParentPage = false;
    const query: Prisma.PageUpdateArgs = {
      data: {},
      where: {
        id: page.id
      }
    };
    if (name) {
      query.data.name = name;
    }
    if (parentId && page.parentId !== parentId) {
      const parent = await prisma.page.findFirst({
        where: {
          id: parentId
        }
      });
      if (!parent) {
        return res.status(400).json({ error: 'There is no page with an id matching the provided parentId.' });
      }

      const instancePathsUnique = await pageInstanceSlugsAreUniqueOnParentPage(page.id, parent.id);
      if (!instancePathsUnique) {
        return res.status(400).json({ error: 'One of the page instances has the same slug as one of the new parent\'s instances.' });
      }

      changeOfParentPage = true;
      query.data.parentId = parentId;
    }

    /**
     * If you are changing the page from front page to non-front page or the other way around,
     * we want to make sure we update the childrens paths based on that change.
     *
     * If we change the page from front-page to non-front-page, then the instances paths AND slugs should
     * be reset to empty strings. And if we change a non-front-page to a front page, we want to change the
     * instances slugs and paths to "/".
     */
    if (typeof isFrontPage === 'boolean') {
      if (isFrontPage) {
        if (changeOfParentPage) {
          return res.status(400).json({ error: 'You cannot assign a page a parent and assign it to be the front page.' });
        }

        const childPage = await prisma.page.findFirst({
          where: {
            parentId: page.id
          }
        });
        if (childPage) {
          return res.status(400).json({ error: 'You cannot assign a page to be the front page if they have child pages. Please remove the child pages as children of the page, before assigning it as the front page.' });
        }

        if (!page.isFrontPage) {
          const existingFrontPage = await prisma.page.findFirst({
            where: {
              isFrontPage: true,
              siteId: page.siteId
            }
          });
          if (existingFrontPage) {
            return res.status(400).json({ error: 'There already exists a front page on this site. Update that page first before updating this page.' });
          }
          changeOfFrontpage = true;
        }
      } else if (!isFrontPage && page.isFrontPage) {
        changeOfFrontpage = true;
      }
    }
    if (changeOfFrontpage) {
      query.data.isFrontPage = isFrontPage;
    }

    const updatedPage = await prisma.page.update(query);
    if (changeOfParentPage || changeOfFrontpage) {
      await updateAllPageInstancePaths({
        page: updatedPage,
        changeOfFrontpage,
        changeOfParentPage
      });
    }

    res.json({ data: { updated: true } });
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

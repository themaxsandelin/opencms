// Dependencies
import { Router, Request, Response, NextFunction } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';

// Routers
import PageRouter from './pages';

// Utils
import { validateRequest } from '@open-cms/shared/utils';

// Data schema
import { createSiteSchema, updateSiteSchema } from './schema';

const prisma = new PrismaClient();
const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const sites = await prisma.site.findMany({
      include: {
        createdBy: true,
        updatedBy: true
      }
    });
    res.json({ data: sites });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', validateRequest(createSiteSchema), async (req: Request, res: Response) => {
  try {
    const { name, key, user } = req.body;
    const site = await prisma.site.create({
      data: {
        name,
        key,
        createdByUserId: user.id,
        updatedByUserId: user.id,
      }
    });

    // Log site creation.
    await prisma.activityLog.create({
      data: {
        action: 'create',
        resourceType: 'site',
        resourceId: site.id,
        createdByUserId: user.id
      }
    });

    res.json({ data: site });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'The key is already being used by a different site.' });
      }
    }
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.use('/:siteId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { siteId } = req.params;
    if (!siteId) {
      return res.status(400).json({ error: 'You have to define a site ID.' });
    }

    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
      }
    });
    if (!site) {
      return res.status(404).json({ error: 'Site not found.' });
    }

    req.body.site = site;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:siteId', (req: Request, res: Response) => {
  try {
    const { site } = req.body;
    // Pass along the already fetched site from the middleware
    res.json({ data: site });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:siteId', validateRequest(updateSiteSchema), async (req: Request, res: Response) => {
  try {
    const { name, key, site, user } = req.body;
    if (name || key) {
      const query: Prisma.SiteUpdateArgs = {
        data: {
          updatedByUserId: user.id,
        },
        where: {
          id: site.id
        }
      };
      if (name) {
        query.data.name = name;
      }
      if (key) {
        const existingSiteWithKey = await prisma.site.findFirst({
          where: {
            key
          }
        });
        if (existingSiteWithKey) {
          return res.status(400).json({ error: 'The key you provided is already assigned to an existing site.' });
        }
        query.data.key = key;
      }
      await prisma.site.update(query);

      // Log site update.
      await prisma.activityLog.create({
        data: {
          action: 'update',
          resourceType: 'site',
          resourceId: site.id,
          createdByUserId: user.id
        }
      });

      res.json({ data: { updated: true } });
    } else {
      res.json({ data: { updated: false } });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Sub routes
router.use('/:siteId/pages', PageRouter);

export default router;

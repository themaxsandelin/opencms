// Dependencies
import { Router, Request, Response, NextFunction } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';

// Routers
import PageRouter from './pages';

// Controller
import { deleteSite } from './controller';

// Utils
import { validateRequest } from '@open-cms/utils';

// Data schema
import { createSiteSchema } from './schema';

const prisma = new PrismaClient();
const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const sites = await prisma.site.findMany();
    res.json(sites);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', validateRequest(createSiteSchema), async (req: Request, res: Response) => {
  try {
    const { name, key } = req.body;
    const site = await prisma.site.create({
      data: { name, key }
    });
    res.json(site);
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
    res.json(site);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:siteId', async (req: Request, res: Response) => {
  try {
    const { site } = req.body;
    await deleteSite(site);

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Sub routes
router.use('/:siteId/pages', PageRouter);

export default router;

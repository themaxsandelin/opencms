// Dependencies
import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

// Utils
import { validateRequest } from '@/utils/validation';

// Schemas
import { createPageSchema } from './schema';

const prisma = new PrismaClient();
const router = Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response) => {
  try {
    const pages = await prisma.page.findMany({
      where: {
        siteId: req.body.site.id
      }
    })
    res.json(pages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: JSON.stringify(error) });
  }
});

router.post('/', validateRequest(createPageSchema), async (req: Request, res: Response) => {
  try {
    const { title, slug } = req.body;

    const existingPageBySlug = await prisma.page.findFirst({
      where: {
        slug,
        siteId: req.body.site.id
      }
    });
    if (existingPageBySlug) {
      return res.status(400).json({ error: `There already is a page on this site with the slug ${slug}.` });
    }

    const page = await prisma.page.create({
      data: {
        title,
        slug,
        siteId: req.body.site.id
      }
    });
    res.json(page);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: JSON.stringify(error) });
  }
});

export default router;

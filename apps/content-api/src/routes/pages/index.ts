// Dependencies
import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

// Shared
import { validateRequest } from '@open-cms/shared/utils';

// Validation schemas
import { queryPagesSchema } from './schema';

const prisma = new PrismaClient();
const router = Router();

router.get('/', validateRequest(queryPagesSchema), async (req: Request, res: Response) => {
  try {
    const { slug, path } = req.query;
    const { selectedLocale, site } = req.body;

    const query: Prisma.PageInstanceFindManyArgs = {
      where: {
        page: {
          siteId: site.id
        }
      },
      select: {
        title: true,
        description: true,
        slug: true,
        path: true,
      }
    };
    if (slug) {
      query.where.slug = (slug as string);
    } else if (path) {
      query.where.path = (path as string);
    }
    if (selectedLocale) {
      query.where.localeCode = selectedLocale.code;
    }

    const pageInstances = await prisma.pageInstance.findMany(query);

    res.json({ data: pageInstances });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

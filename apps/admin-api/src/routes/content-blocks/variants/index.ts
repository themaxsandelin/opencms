// Dependencies
import { Router, Request, Response, NextFunction } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';

// Routers
import VersionRouter from './versions';

// Utils
import { validateRequest } from '@open-cms/utils';

// Validation schema
import { createVariantSchema } from './schema';

const prisma = new PrismaClient();
const router = Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response) => {
  try {
    const { contentBlock } = req.body;
    const variants = await prisma.contentBlockVariant.findMany({
      where: {
        contentBlockId: contentBlock.id
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        sites: {
          select: {
            siteId: true
          }
        }
      }
    });
    return res.json(variants);
  } catch (error) {
    res.status(500).json({ error: JSON.stringify(error) });
  }
});

router.post('/', validateRequest(createVariantSchema), async (req: Request, res: Response) => {
  try {
    const { name, sites, contentBlock } = req.body;
    const createQuery: Prisma.ContentBlockVariantCreateArgs = {
      data: {
        name,
        contentBlockId: contentBlock.id
      }
    };
    if (sites.length) {
      createQuery.data.sites = {
        create: sites.map((siteId: string) => ({
          site: {
            connect: {
              id: siteId
            }
          }
        }))
      }
    }

    const variant = await prisma.contentBlockVariant.create(createQuery);
    res.json(variant);
  } catch (error) {
    res.status(500).json({ error: JSON.stringify(error) });
  }
});

router.use('/:variantId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { variantId } = req.params;
    const variant = await prisma.contentBlockVariant.findFirst({
      where: {
        id: variantId
      }
    });
    if (!variant) {
      return res.status(404).json({ error: 'Content block variant not found.' });
    }

    req.body.contentBlockVariant = variant;
    next();
  } catch (error) {
    res.status(500).json({ error: JSON.stringify(error) });
  }
});
router.use('/:variantId/versions', VersionRouter);

export default router;

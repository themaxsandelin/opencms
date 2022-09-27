// Dependencies
import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, Prisma, ContentBlock } from '@prisma/client';

// Routers
import VariantRouter from './variants';

// Utils
import { validateRequest } from '@open-cms/utils';

// Data schema
import { createContentBlockSchema } from './schema';

const prisma = new PrismaClient();
const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { type } = req.query;

    const query: Prisma.ContentBlockFindManyArgs = {};
    if (type) {
      query.where = {
        type: (type as string)
      };
    }
    const contentBlocks = await prisma.contentBlock.findMany(query);
    return res.json(contentBlocks);
  } catch (error) {
    res.status(500).json({ error: JSON.stringify(error) });
  }
});

router.post('/', validateRequest(createContentBlockSchema), async (req: Request, res: Response) => {
  try {
    const { name, type, parentIds } = req.body;

    const parentType = type === 'question' ? 'question-category' : null;
    let parents: Array<ContentBlock> = [];
    if (parentIds && parentIds.length && parentType) {
      try {
        parents = await Promise.all(
          parentIds.map(async (parentId: string) => {
            const parent = await prisma.contentBlock.findFirst({
              where: {
                id: parentId,
                type: parentType
              }
            });
            if (!parent) {
              throw new Error(`Could not find ${parentType} content block by ID ${parentId}.`);
            }
            return parent;
          })
        );
      } catch (error) {
        return res.status(400).json({ error: error.message });
      }
    }

    const contentBlock = await prisma.contentBlock.create({
      data: {
        name,
        type
      }
    });

    if (parents.length) {
      await Promise.all(
        parents.map(parent => prisma.childContentBlock.create({
          data: {
            parentId: parent.id,
            childId: contentBlock.id
          }
        }))
      );
    }

    res.json(contentBlock);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: JSON.stringify(error) });
  }
});

router.use('/:blockId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const contentBlock = await prisma.contentBlock.findFirst({
      where: {
        id: req.params.blockId
      }
    });
    if (!contentBlock) {
      return res.status(404).json({ error: 'No content block found.' });
    }

    req.body.contentBlock = contentBlock;
    next();
  } catch (error) {
    res.status(500).json({ error: JSON.stringify(error) });
  }
});
router.use('/:blockId/variants', VariantRouter);

export default router;

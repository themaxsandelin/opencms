// Dependencies
import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, Prisma, ContentBlock } from '@prisma/client';

// Routers
import VariantRouter from './variants';

// Shared
import { validateRequest } from '@open-cms/shared/utils';

// Utils
import logger from '../../utils/logger';

// Data schema
import { createContentBlockSchema, patchContentBlockSchema } from './schema';

const prisma = new PrismaClient();
const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, search } = req.query;

    const query: Prisma.ContentBlockFindManyArgs = {
      include: {
        children: {
          select: {
            child: {
              select: {
                id: true,
                name: true,
                type: true,
                createdAt: true,
                updatedAt: true
              }
            }
          }
        },
        parents: {
          select: {
            parent: {
              select: {
                id: true,
                name: true,
                type: true,
                createdAt: true,
                updatedAt: true
              }
            }
          }
        },
        createdBy: true,
        updatedBy: true,
      }
    };
    if (type) {
      query.where = {
        type: (type as string)
      };
    }
    if (search) {
      query.where.OR = [
        {
          name: {
            contains: (search as string)
          }
        }
      ];
    }
    const contentBlocks = await prisma.contentBlock.findMany(query);

    return res.json({
      data: contentBlocks.map((contentBlock: any) => {
        contentBlock.parents = contentBlock.parents.map(parentBlock => parentBlock.parent);
        contentBlock.children = contentBlock.children.map(childBlock => childBlock.child);
        return contentBlock;
      })
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', validateRequest(createContentBlockSchema, logger), async (req: Request, res: Response) => {
  try {
    const { name, type, parentIds, user } = req.body;

    let parentType: string | null = null;
    if (type === 'question') {
      parentType = 'question-category';
    } else if (type === 'question-category') {
      parentType = 'question-category';
    }
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
        logger.error(error);
        return res.status(400).json({ error: error.message });
      }
    }

    const contentBlock = await prisma.contentBlock.create({
      data: {
        name,
        type,
        createdByUserId: user.id,
        updatedByUserId: user.id
      }
    });

    if (parents.length) {
      await Promise.all(
        parents.map(parent => prisma.childContentBlock.create({
          data: {
            parentId: parent.id,
            childId: contentBlock.id,
            createdByUserId: user.id,
            updatedByUserId: user.id
          }
        }))
      );
    }

    // Log content block creation.
    await prisma.activityLog.create({
      data: {
        action: 'create',
        resourceType: 'contentBlock',
        resourceId: contentBlock.id,
        createdByUserId: user.id
      }
    });

    res.json({ data: contentBlock });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.use('/:blockId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type } = req.query;
    const query: Prisma.ContentBlockFindManyArgs = {
      where: {
        id: req.params.blockId
      }
    };
    if (type) {
      query.where.type = (type as string);
    }

    const contentBlock = await prisma.contentBlock.findFirst(query);
    if (!contentBlock) {
      return res.status(404).json({ error: 'No content block found.' });
    }

    req.body.contentBlock = contentBlock;
    next();
  } catch (error) {
    logger.error('Server error', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:blockId', (req: Request, res: Response) => {
  try {
    const { contentBlock } = req.body;
    res.json({ data: contentBlock });
  } catch (error) {
    logger.error('Server error', error);
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:blockId', validateRequest(patchContentBlockSchema, logger), async (req: Request, res: Response) => {
  try {
    const { name, contentBlock, user } = req.body;
    const parentIds = req.body.parentIds || [];

    const existingParentRelations = await prisma.childContentBlock.findMany({
      where: {
        childId: contentBlock.id
      }
    });
    const existingParentIds = existingParentRelations.map(relationship => relationship.parentId);
    const newParentIds = parentIds.filter((parentId: string) => !existingParentIds.includes(parentId));
    const deleteExistinParentIds = existingParentIds.filter((parentId: string) => !parentIds.includes(parentId));

    // First, delete any old relationships that are not included in the request body.
    await Promise.all(
      deleteExistinParentIds.map(async (parentId: string) => {
        const item = existingParentRelations.find(item => item.parentId === parentId);
        await prisma.childContentBlock.delete({
          where: {
            id: item.id
          }
        });
      })
    );

    // Secondly, make sure to check that the new parent IDs all exist.
    let newParents: Array<ContentBlock> = [];
    if (newParentIds.length) {
      const parentType = contentBlock.type === 'question' ? 'question-category' : null;
      if (parentType) {
        try {
          newParents = await Promise.all(
            newParentIds.map(async (parentId: string) => {
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

      // Then finally create the new parent relationships.
      await Promise.all(
        newParents.map(parent => prisma.childContentBlock.create({
          data: {
            parentId: parent.id,
            childId: contentBlock.id,
            createdByUserId: user.id,
            updatedByUserId: user.id
          }
        }))
      );
    }

    // Finally, update the name of the content block based on the request body.
    await prisma.contentBlock.update({
      data: {
        name,
        updatedByUserId: user.id
      },
      where: {
        id: contentBlock.id
      }
    });

    // Log content block update.
    await prisma.activityLog.create({
      data: {
        action: 'update',
        resourceType: 'contentBlock',
        resourceId: contentBlock.id,
        createdByUserId: user.id
      }
    });

    res.json({ data: { updated: true } });
  } catch (error) {
    logger.error('Server error', error);
    res.status(500).json({ error: error.message });
  }
});

router.use('/:blockId/variants', VariantRouter);

export default router;

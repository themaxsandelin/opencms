// Dependencies
import { Router, Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';

// Utils
import { validateRequest } from '@open-cms/shared/utils';

// Controller
import { getContentBlockParentById, getContentBlockBySlug } from './controller';

// Validation schemas
import { queryContentBlockSchema } from './schema';

const prisma = new PrismaClient();
const router = Router();

router.get('/', validateRequest(queryContentBlockSchema), async (req: Request, res: Response) => {
  try {
    const { selectedLocale, publishingEnvironment, site } = req.body;
    const { type, parentSlug, siblingSlug, limit, page } = req.query;

    let countLimit = 10;
    const providedLimit = limit as string;
    if (providedLimit) {
      const parsedProvidedLimit = parseInt(providedLimit);
      if (!isNaN(parsedProvidedLimit)) {
        countLimit = parsedProvidedLimit;
      }
    }

    let paginationPage = 1;
    const providedPage = page as string;
    if (providedPage) {
      const parsedProvidedPage = parseInt(providedPage);
      if (!isNaN(parsedProvidedPage)) {
        paginationPage = parsedProvidedPage;
      }
    }

    if (parentSlug && siblingSlug) {
      return res.status(400).json({ error: 'Parameters parentSlug and siblingSlug cannot both be provided. Choose either or.' });
    }

    let parentBlock;
    if (parentSlug) {
      let parentType;
      if (type === 'question') {
        parentType = 'question-category';
      }
      const parentRef = await getContentBlockBySlug((parentSlug as string), parentType, site.id, publishingEnvironment.id, selectedLocale.code);
      if (parentRef) {
        parentBlock = parentRef.version.variant.contentBlock
      }
    }

    let siblingBlock;
    if (siblingSlug) {
      const siblingRef = await getContentBlockBySlug((siblingSlug as string), (type as string), site.id, publishingEnvironment.id, selectedLocale.code);
      if (siblingRef) {
        siblingBlock = siblingRef.version.variant.contentBlock;
      }
    }

    const where = {
      environmentId: publishingEnvironment.id,
      version: {
        localeCode: selectedLocale.code,
        variant: {
          sites: {
            some: {
              siteId: site.id
            }
          },
          contentBlock: {
            type: (type as string),
          }
        }
      }
    }
    const blocksQuery: Prisma.ContentBlockVariantVersionPublicationFindManyArgs = {
      where: {...where}
    };
    const countQuery: Prisma.ContentBlockVariantVersionPublicationCountArgs = {
      where: {...where}
    };
    if (parentBlock) {
      blocksQuery.where.version.variant.contentBlock.parents = {
        some: {
          parentId: parentBlock.id
        }
      };
      countQuery.where.version.variant.contentBlock.parents = {
        some: {
          parentId: parentBlock.id
        }
      };
    } else if (siblingBlock) {
      // Exclude sibling from results.
      blocksQuery.where.version.variant.contentBlock.NOT = {
        id: siblingBlock.id
      };
      countQuery.where.version.variant.contentBlock.NOT = {
        id: siblingBlock.id
      };
      const { parents } = siblingBlock;
      blocksQuery.where.version.variant.contentBlock.parents = {
        some: {
          OR: parents.map(({ parentId }) => ({
            parentId
          }))
        }
      };
      countQuery.where.version.variant.contentBlock.parents = {
        some: {
          OR: parents.map(({ parentId }) => ({
            parentId
          }))
        }
      };
    }

    const take = countLimit;
    const skip = countLimit * (paginationPage - 1);
    const contentBlocks = await prisma.contentBlockVariantVersionPublication.findMany({
      take,
      skip,
      ...blocksQuery,
      include: {
        version: {
          include: {
            variant: {
              include: {
                contentBlock: {
                  include: {
                    parents: true
                  }
                }
              }
            }
          }
        }
      }
    });

    const total = await prisma.contentBlockVariantVersionPublication.count(countQuery);
    const last = Math.ceil(total / take);
    const pagination: { current: number; next?: number; last: number; } = {
      current: paginationPage,
      last
    };
    if (paginationPage !== last) {
      pagination.next = paginationPage + 1;
    }

    const mappedBlocks = await Promise.all(
      contentBlocks.map(async (contentBlock) => {
        let parentBlocks = [];
        if (contentBlock.version.variant.contentBlock.parents.length) {
          parentBlocks = await Promise.all(
            contentBlock.version.variant.contentBlock.parents.map(async ({ parentId }) => {
              const parentBlock = await getContentBlockParentById(parentId, site.id, publishingEnvironment.id, selectedLocale.code);
              if (!parentBlock) return null;
              const { version } = parentBlock;
              const content = version.content ? JSON.parse(version.content) : '';

              return {
                name: content ? content.name : '',
                slug: version.slug,
                localeCode: version.localeCode
              };
            })
          );
          parentBlocks = parentBlocks.filter(Boolean);
        }

        const { version } = contentBlock;
        const content = JSON.parse(version.content);
        return {
          ...content,
          slug: version.slug,
          parents: parentBlocks
        };
      })
    );

    mappedBlocks.sort((block1, block2) => {
      if (block1.name > block2.name) return 1;
      if (block1.name < block2.name) return -1;
      return 0;
    }).filter(block => block.parents.length > 0);

    res.json({ data: mappedBlocks, pagination });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

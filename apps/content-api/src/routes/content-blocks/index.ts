// Dependencies
import { Router, Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';

// Utils
import { validateRequest } from '@open-cms/shared/utils';
import locales from '@open-cms/shared/locales';

// Utils
import { getContentBlockParentById, getContentBlockBySlug } from './controller';

// Validation schemas
import { queryContentBlockSchema } from './schema';

const prisma = new PrismaClient();
const router = Router();

router.get('/', validateRequest(queryContentBlockSchema), async (req: Request, res: Response) => {
  try {
    const { type, environment, locale, site: siteKey, parentSlug, siblingSlug } = req.query;

    const selectedLocale = locales.find(localeObj => localeObj.code.toLowerCase() === (locale as string).toLowerCase());
    if (!selectedLocale) {
      return res.status(400).json({ error: `The provided locale code ${locale} is not valid.` });
    }

    const publishingEnvironment = await prisma.publishingEnvironment.findFirst({
      where: {
        key: (environment as string)
      }
    });
    if (!publishingEnvironment) {
      return res.status(400).json({ error: 'Invalid or unknown environment key.' });
    }

    const site = await prisma.site.findFirst({
      where: {
        key: (siteKey as string)
      }
    });
    if (!site) {
      return res.status(400).json({ error: `Could not find a site with the key ${siteKey}` });
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

    const blocksQuery: Prisma.ContentBlockVariantVersionPublicationFindManyArgs = {
      where: {
        environmentId: publishingEnvironment.id,
        version: {
          locale: selectedLocale.code,
          variant: {
            sites: {
              some: {
                siteId: site.id
              }
            },
            contentBlock: {
              type: (type as string)
            }
          }
        }
      }
    };
    if (parentBlock) {
      blocksQuery.where.version.variant.contentBlock.parents = {
        some: {
          parentId: parentBlock.id
        }
      };
    } else if (siblingBlock) {
      // Exclude sibling from results.
      blocksQuery.where.version.variant.contentBlock.NOT = {
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
    }
    const contentBlocks = await prisma.contentBlockVariantVersionPublication.findMany({
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
                localeCode: version.locale
              };
            })
          );
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
    }).filter(block => block.parents.length);

    res.json({ data: mappedBlocks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
// Dependencies
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

// Controller
import { getContentBlockParentById } from '../content-blocks/controller';

// Schemas
import { searchQuerySchema } from './schema';

// Shared
import { validateRequest } from '@open-cms/shared/utils';

// Utils
import logger from '../../utils/logger';

const prisma = new PrismaClient();
const router = Router();

router.get('/', validateRequest(searchQuerySchema, logger), async (req: Request, res: Response) => {
  try {
    const { selectedLocale, publishingEnvironment, site } = req.body;

    const { term, limit, page } = req.query;

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

    const take = countLimit;
    const skip = countLimit * (paginationPage - 1);
    const where = {
      environmentId: publishingEnvironment.id,
      version: {
        content: {
          contains: term as string
        },
        localeCode: selectedLocale.code,
        variant: {
          sites: {
            some: {
              siteId: site.id
            }
          },
          contentBlock: {
            type: 'question'
          }
        }
      }
    };

    const questions = await prisma.contentBlockVariantVersionPublication.findMany({
      take,
      skip,
      where,
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

    const total = await prisma.contentBlockVariantVersionPublication.count({ where });
    const last = Math.ceil(total / take);
    const pagination: { current: number; next?: number; last: number; } = {
      current: paginationPage,
      last
    };
    if (paginationPage !== last) {
      pagination.next = paginationPage + 1;
    }

    const mappedBlocks = await Promise.all(
      questions.map(async (contentBlock) => {
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

    res.json({
      pagination,
      data: mappedBlocks.sort((itemA, itemB) => {
        const aHasInQuestion = itemA.question.includes(term as string);
        const bHasInQuestion = itemB.question.includes(term as string);
        if (aHasInQuestion && !bHasInQuestion) return -1;
        if (!aHasInQuestion && bHasInQuestion) return 1;
        return 0;
      })
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

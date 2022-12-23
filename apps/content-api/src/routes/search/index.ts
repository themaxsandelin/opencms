// Dependencies
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

// Utils
import { validateRequest } from '@open-cms/shared/utils';

// Schemas
import { searchQuerySchema } from './schema';

const prisma = new PrismaClient();
const router = Router();

router.get('/', validateRequest(searchQuerySchema), async (req: Request, res: Response) => {
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
        version: true
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

    res.json({
      pagination,
      data: questions.map(question => {
        const { version } = question;
        const content = JSON.parse(version.content);

        return {
          ...content,
          slug: version.slug,
        };
      }).sort((itemA, itemB) => {
        const aHasInQuestion = itemA.question.includes(term as string);
        const bHasInQuestion = itemB.question.includes(term as string);
        if (aHasInQuestion && !bHasInQuestion) return -1;
        if (!aHasInQuestion && bHasInQuestion) return 1;
        return 0;
      })
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

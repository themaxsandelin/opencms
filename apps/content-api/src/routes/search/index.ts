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

    const { term } = req.query;

    const questions = await prisma.contentBlockVariantVersionPublication.findMany({
      where: {
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
      },
      include: {
        version: true
      }
    });

    res.json({
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

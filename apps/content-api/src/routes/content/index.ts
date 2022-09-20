// Dependencies
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

// Utils
import { validateRequest, locales } from '@open-cms/utils';

// Validation schemas
import { queryContentSchema } from './schema';

const prisma = new PrismaClient();
const router = Router();

router.get('/', validateRequest(queryContentSchema), async (req: Request, res: Response) => {
  try {
    const { pagePath, environment, site: siteKey, locale } = req.query;

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

    const page = await prisma.page.findFirst({
      where: {
        slug: (pagePath as string),
        siteId: site.id
      }
    });
    if (!page) {
      return res.status(400).json({ error: `Could not find a page with the path ${pagePath}.` });
    }

    const selectedLocale = locales.find(localeObj => localeObj.code.toLowerCase() === (locale as string).toLowerCase());
    if (!selectedLocale) {
      return res.status(400).json({ error: `The provided locale code ${locale} is not valid.` });
    }

    const publishedLayout = await prisma.pageLayoutVersionPublication.findFirst({
      where: {
        environmentId: publishingEnvironment.id,
        version: {
          layout: {
            page: {
              id: page.id
            }
          }
        }
      },
      include: {
        version: {
          select: {
            content: true
          }
        }
      }
    });
    if (!publishedLayout) {
      return res.status(204).send();
    }

    const { version } = publishedLayout;
    const content: { blocks: Array<string> } = JSON.parse(version.content);

    const fetchedContent = await Promise.all(
      content.blocks.map(async (blockId) => {
        const publishedBlock = await prisma.contentBlockVariantVersionPublication.findFirst({
          where: {
            environmentId: publishingEnvironment.id,
            version: {
              variant: {
                contentBlock: {
                  id: blockId
                }
              }
            }
          },
          include: {
            version: {
              select: {
                content: true
              }
            }
          }
        });
        if (!publishedBlock) {
          return null;
        }

        return JSON.parse(publishedBlock.version.content);
      })
    );

    res.json(fetchedContent.filter(Boolean));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as any).message });
  }
});

export default router;

// Dependencies
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

// Utils
import { validateRequest, locales } from '@open-cms/utils';

// Validation schemas
import { queryContentBlockSchema } from './schema';

const prisma = new PrismaClient();
const router = Router();

router.get('/', validateRequest(queryContentBlockSchema), async (req: Request, res: Response) => {
  try {
    const { type, environment, locale, site: siteKey } = req.query;

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

    const contentBlocks = await prisma.contentBlockVariantVersionPublication.findMany({
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
      },
      include: {
        version: true
      }
    });

    const mappedBlocks = contentBlocks.map(contentBlock => {
      const { version } = contentBlock;
      const content = JSON.parse(version.content);
      return {
        ...content,
        slug: version.slug
      };
    }).sort((block1, block2) => {
      if (block1.name > block2.name) return 1;
      if (block1.name < block2.name) return -1;
      return 0;
    });

    res.json({ data: mappedBlocks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

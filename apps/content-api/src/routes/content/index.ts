// Dependencies
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

// Shared
import { validateRequest } from '@open-cms/shared/utils';

// Utils
import logger from '../../utils/logger';
import { completeComponentReferences, findPageInstanceListFromPath } from './controller';

// Validation schemas
import { queryContentSchema } from './schema';

const prisma = new PrismaClient();
const router = Router();

router.get('/', validateRequest(queryContentSchema, logger), async (req: Request, res: Response) => {
  try {
    const { selectedLocale, publishingEnvironment, site } = req.body;
    const { pagePath } = req.query;

    const pageInstances = await findPageInstanceListFromPath((pagePath as string), site.id, publishingEnvironment.id, selectedLocale.code);
    if (!pageInstances.length) {
      return res.status(404).json({ error: 'Page not found.' });
    }

    const pageInstance = pageInstances[pageInstances.length - 1];
    const breadcrumbs = pageInstances.map(pageInstance => {
      const { description, pageData } = pageInstance;

      let title = pageInstance.title;
      let slug = pageInstance.slug;
      let path = pageInstance.path;
      if (pageData) {
        if (pageData.data.slug) {
          slug = pageData.data.slug;
          path = path.replace('/*', slug);
        }
        if (pageData.data.name) {
          title = pageData.data.name;
        } else if (pageData.data.question) {
          title = pageData.data.question;
        }
      }
      return {
        title,
        description,
        slug,
        path
      };
    });

    const content = {
      data: pageInstances.filter(pageInstance => pageInstance.pageData).map(pageInstance => pageInstance.pageData),
      layout: {}
    };

    const layout = await prisma.pageLayoutVersionPublication.findFirst({
      where: {
        environmentId: publishingEnvironment.id,
        version: {
          layout: {
            instances: {
              some: {
                pageInstanceId: pageInstance.id
              },
              none: {
                pageInstance: {
                  deleted: true
                }
              }
            }
          }
        }
      },
      include: {
        version: true
      }
    });
    if (layout) {
      const { version } = layout;
      content.layout = JSON.parse(
        await completeComponentReferences(version.content, site.id, publishingEnvironment.id, selectedLocale.code)
      );
    }

    const { title, description } = pageInstance;

    res.json({
      data: {
        page: {
          title,
          description
        },
        breadcrumbs,
        content
      }
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

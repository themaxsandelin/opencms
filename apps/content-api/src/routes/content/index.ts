// Dependencies
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

// Shared
import { validateRequest } from '@open-cms/shared/utils';

// Utils
import { completeComponentReferences, findPageInstanceListFromPath } from './controller';

// Validation schemas
import { queryContentSchema } from './schema';

const prisma = new PrismaClient();
const router = Router();

router.get('/', validateRequest(queryContentSchema), async (req: Request, res: Response) => {
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
        if (pageData.slug) {
          slug = pageData.slug;
          path = path.replace('/*', slug);
        }
        if (pageData.name) {
          title = pageData.name;
        } else if (pageData.question) {
          title = pageData.question;
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
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

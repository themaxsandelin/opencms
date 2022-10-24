// Dependencies
import { Router, Request, Response } from 'express';
import { PrismaClient, PageInstance } from '@prisma/client';

// Utils
import { validateRequest, locales } from '@open-cms/utils';

// Validation schemas
import { queryContentSchema } from './schema';

const prisma = new PrismaClient();
const router = Router();

async function findPageInstanceFromPathPieces(siteId: string, pieces: Array<string>, localeCode: string, previousPathMatch = '') {
  let instances = [];

  const piece = pieces.splice(0, 1);
  const paths = [`${previousPathMatch}/${piece}`, `${previousPathMatch}/*`];
  const pageInstance = await prisma.pageInstance.findFirst({
    where: {
      localeCode,
      OR: [
        {
          path: paths[0]
        },
        {
          path: paths[1]
        }
      ],
      AND: {
        page: {
          siteId
        }
      }
    }
  });
  if (pageInstance) {
    const matchingPath = pageInstance.path === paths[0] ? paths[0] : paths[1];
    instances.push(pageInstance);
    if (pieces.length) {
      const childInstances = await findPageInstanceFromPathPieces(siteId, pieces, localeCode, matchingPath);
      instances = [...instances, ...childInstances];
    }
  }

  return instances;
}

async function findPageInstanceListFromPath(siteId: string, path: string, localeCode: string): Promise<Array<PageInstance>> {
  const pathGroups = [];
  const pathPieces = (path as string).split('/').filter(Boolean);

  pathPieces.reduce((accumulatedPath: string, piece: string) => {
    const mainPath = `${accumulatedPath}/${piece}`;
    const catchAllPath = `${accumulatedPath}/*`;
    pathGroups.push({ mainPath, catchAllPath });
    return mainPath;
  }, '');

  const pages = await findPageInstanceFromPathPieces(siteId, pathPieces, localeCode);
  const filteredPages = pages.filter(page => page !== null);
  if (filteredPages.length !== pathGroups.length) {
    return [];
  }

  return filteredPages;
}

router.get('/', validateRequest(queryContentSchema), async (req: Request, res: Response) => {
  try {
    const { pagePath, environment, site: siteKey, locale } = req.query;

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

    const pageInstances = await findPageInstanceListFromPath(site.id, (pagePath as string), selectedLocale.code);
    if (!pageInstances.length) {
      return res.status(404).json({ error: 'Page not found.' });
    }

    const pageInstance = pageInstances[pageInstances.length - 1];
    const breadcrumbs = pageInstances.map(pageInstance => {
      const { title, description, slug, path } = pageInstance;
      return { title, description, slug, path };
    });

    const content = {
      data: null,
      layout: null
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
      content.layout = JSON.parse(version.content);
    }

    if (pageInstance.config) {
      const config = JSON.parse(pageInstance.config);

      if (config.data) {
        const { source, type } = config.data;
        if (source === 'route-parameter') {
          const pathPieces = (pagePath as string).split('/').filter(Boolean);
          const slug = `/${pathPieces[pathPieces.length - 1]}`;
          const [ resource, resourceType ] = type.split('_').filter(Boolean);
          if (resource === 'content-block') {
            const publishedResource = await prisma.contentBlockVariantVersionPublication.findFirst({
              where: {
                environment: {
                  id: publishingEnvironment.id
                },
                version: {
                  slug,
                  locale: selectedLocale.code,
                  variant: {
                    contentBlock: {
                      type: resourceType
                    },
                    sites: {
                      some: {
                        siteId: site.id
                      }
                    }
                  }
                }
              },
              include: {
                version: {
                  include: {
                    variant: {
                      include: {
                        contentBlock: true
                      }
                    }
                  }
                }
              }
            });
            if (publishedResource) {
              const { version } = publishedResource;
              content.data = {
                ...JSON.parse(version.content),
                slug
              };
            }
          }
        }
      }
    }

    const { title, description } = pageInstance;

    res.json({
      page: {
        title,
        description
      },
      breadcrumbs,
      content
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

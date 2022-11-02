// Dependencies
import { PrismaClient, PageInstance } from '@prisma/client';

// Types
import { PageInstanceExtended } from '../../types';

const prisma = new PrismaClient();

export async function getPageInstanceData(pageInstance: PageInstance, slug: string, publishingEnvironmentId: string, siteId: string, localeCode: string) {
  let data;
  if (pageInstance.config) {
    const config = JSON.parse(pageInstance.config);
    const { source, type } = config.data;
    if (source === 'route-parameter' && pageInstance.slug === '/*') {
      const [ resource, resourceType ] = type.split('_').filter(Boolean);
      if (resource === 'content-block') {
        const publishedResource = await prisma.contentBlockVariantVersionPublication.findFirst({
          where: {
            environment: {
              id: publishingEnvironmentId
            },
            version: {
              slug,
              locale: localeCode,
              variant: {
                contentBlock: {
                  type: resourceType
                },
                sites: {
                  some: {
                    siteId: siteId
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
        if (publishedResource) {
          const { version } = publishedResource;
          data = {
            ...JSON.parse(version.content),
            slug
          };
        }
      }
    }
  }
  return data;
}

async function findPageInstanceFromPathPieces(pieces: Array<string>, siteId: string, environmentId, localeCode: string, previousPathMatch = '') {
  let instances = [];

  const piece = pieces.splice(0, 1);
  const paths = [`${previousPathMatch}/${piece}`, `${previousPathMatch}/*`];
  const pageInstance: PageInstanceExtended = await prisma.pageInstance.findFirst({
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
    const data = await getPageInstanceData(pageInstance, `/${piece}`, environmentId, siteId, localeCode)
    pageInstance.pageData = data;

    const matchingPath = pageInstance.path === paths[0] ? paths[0] : paths[1];
    instances.push(pageInstance);
    if (pieces.length) {
      const childInstances = await findPageInstanceFromPathPieces(pieces, siteId, environmentId, localeCode, matchingPath);
      instances = [...instances, ...childInstances];
    }
  }

  return instances;
}

export async function findPageInstanceListFromPath(path: string, siteId: string, environmentId: string, localeCode: string): Promise<Array<PageInstanceExtended>> {
  const pathGroups = [];
  const pathPieces = (path as string).split('/').filter(Boolean);

  pathPieces.reduce((accumulatedPath: string, piece: string) => {
    const mainPath = `${accumulatedPath}/${piece}`;
    const catchAllPath = `${accumulatedPath}/*`;
    pathGroups.push({ mainPath, catchAllPath });
    return mainPath;
  }, '');

  const pages = await findPageInstanceFromPathPieces(pathPieces, siteId, environmentId, localeCode);
  const filteredPages = pages.filter(page => page !== null);
  if (filteredPages.length !== pathGroups.length) {
    return [];
  }

  return filteredPages;
}

async function getPageReference(pageId: string, siteId: string, environmentId: string, localeCode: string) {
  return prisma.pageInstance.findFirst({
    where: {
      localeCode,
      page: {
        id: pageId,
        siteId
      }
    },
    select: {
      title: true,
      description: true,
      path: true
    }
  });
}

export async function completeComponentReferences(content: string, siteId: string, environmentId: string, localeCode: string) {
  let copy = `${content}`;
  const regex = /(?:"reference:(?:\S[^"]+)"{1})/gm;
  const matches = [...copy.matchAll(regex)];
  let indexImpact = 0;
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const [stringMatch] = match;
    const [referenceString] = stringMatch.split('"').filter(Boolean);

    const [ , type, id ] = referenceString.split(':');
    let replacement = '{}';
    if (type === 'page') {
      const page = await getPageReference(id, siteId, environmentId, localeCode);
      if (page) {
        replacement = `${JSON.stringify(page)}`;
      }
    }

    const cutStart = match.index + indexImpact;
    const cutEnd = cutStart + stringMatch.length;

    copy = `${copy.substring(0, cutStart)}${replacement}${copy.substring(cutEnd, copy.length)}`;

    indexImpact += (replacement.length - stringMatch.length);
  }
  return copy;
}

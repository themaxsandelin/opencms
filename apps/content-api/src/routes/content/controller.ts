// Dependencies
import { PrismaClient, PageInstance } from '@prisma/client';

// Types
import { PageInstanceExtended } from '../../types';

const prisma = new PrismaClient();

async function getContentBlockById(id: string, publishingEnvironmentId: string, siteId: string, localeCode: string) {
  const block = await prisma.contentBlockVariantVersionPublication.findFirst({
    where: {
      environment: {
        id: publishingEnvironmentId
      },
      version: {
        localeCode,
        variant: {
          contentBlock: {
            id,
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
      version: true
    }
  });
  if (!block) {
    return null;
  }
  const { version } = block;
  return {
    ...JSON.parse(version.content),
    slug: version.slug,
  };
}

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
              localeCode,
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
                        parents: {
                          include: {
                            parent: true
                          }
                        }
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
          const { parents: parentBlocks } = version.variant.contentBlock;
          let parents = [];
          if (parentBlocks.length) {
            parents = await Promise.all(
              parentBlocks.map(async (parentRef) => getContentBlockById(parentRef.parent.id, publishingEnvironmentId, siteId, localeCode))
            );
          }
          data = {
            resource,
            resourceType,
            data: {
              ...JSON.parse(version.content),
              slug,
              parents
            }
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
      deleted: false,
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
    pageInstance.pageData = await getPageInstanceData(pageInstance, `/${piece}`, environmentId, siteId, localeCode)

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

function findObjectBoundaryByTag(matches: Array<RegExpMatchArray>, tag: '{' | '}'): number {
  // Store the number of counterparts (i.e. "{" is a counterpat to "}")
  // so to determine when the object is actually opened, or closed.
  let index = -1;
  let counterParts = 0;
  for (let i = 0; i < matches.length; i++) {
    const [str] = matches[i][0];
    if (str === tag) {
      if (counterParts) {
        counterParts -= 1;
      } else {
        index = matches[i].index;
        break;
      }
    } else {
      counterParts += 1;
    }
  }
  return index;
}

function findObjectBounderies(searchString: string, refIndex: number) {
  const tagRegex = /(?<!\\")[{}]{1}(?!\\")/gm;

  // First, sort to find the closest tag on the left side of the reference index.
  const tagMatches = [...searchString.matchAll(tagRegex)].sort((matchA, matchB) => {
    const { index: indexA } = matchA;
    const { index: indexB } = matchB;
    if (indexA < refIndex) {
      if (indexA < indexB) return 1;
      if (indexA > indexB) return -1;
    }
    return 0;
  });

  const closestTagIndex = tagMatches[0].index;

  // Resort matches by index so we can them split them into two arrays and process them separately.
  // One array will be for the left side of the reference string, the other for the right side.
  const leftMostTagIndex = tagMatches.sort((matchA, matchB) => {
    const { index: indexA } = matchA;
    const { index: indexB } = matchB;
    if (indexA > indexB) return 1;
    if (indexA < indexB) return -1;
    return 0;
  }).findIndex((match) => match.index === closestTagIndex);

  const boundaries: {
    left?: number;
    right?: number;
  } = {};
  // Get the tag matches on the left side of the reference string index.
  const leftSideTags = tagMatches.slice(0, leftMostTagIndex + 1).sort((matchA, matchB) => {
    const { index: indexA } = matchA;
    const { index: indexB } = matchB;
    if (indexA < indexB) return 1;
    if (indexA > indexB) return -1;
    return 0;
  });
  // Do likewise on the right side of the reference string index.
  const rightSideTags = tagMatches.slice(leftMostTagIndex + 1, tagMatches.length);

  boundaries.left = findObjectBoundaryByTag(leftSideTags, '{');
  boundaries.right = findObjectBoundaryByTag(rightSideTags, '}');

  return boundaries;
}

function parseLocalizedInput(content: string, localeCode: string) {
  let searchString = `${content}`;
  let indexOffset = 0;
  const keyRegex = /(?:"type":"localized-input"{1})/gm;
  const keyMatches = [...searchString.matchAll(keyRegex)];
  for (let i = 0; i < keyMatches.length; i++) {
    let replaceString = '""';
    const { index } = keyMatches[i];
    const { left, right } = findObjectBounderies(searchString, (index - indexOffset));
    const localizedStringObject = searchString.substring(left, right + 1);
    const localizedObject: { type: string, values: { [index: string] : string } } = JSON.parse(localizedStringObject);
    if (Object.prototype.hasOwnProperty.call(localizedObject.values, localeCode)) {
      replaceString = JSON.stringify(localizedObject.values[localeCode]);
    }
    searchString = `${searchString.substring(0, left)}${replaceString}${searchString.substring(right + 1, searchString.length)}`;
    indexOffset += localizedStringObject.length - replaceString.length;
  }
  return searchString;
}

async function createFormVersionToken(versionId: string, siteId: string, environmentId: string, localeCode: string) {
  // We might want to put this in a config in the future. But here it is. :)
  const lifetimeInHours = 1;
  const date = new Date();
  date.setTime(date.getTime() + (lifetimeInHours * 60 * 60 * 1000));
  return prisma.formVersionToken.create({
    data: {
      expiresAt: date.toISOString(),
      localeCode,
      versionId,
      siteId,
      environmentId
    }
  });
}

async function getPageReference(pageId: string, siteId: string, environmentId: string, localeCode: string) {
  return prisma.pageInstance.findFirst({
    where: {
      localeCode,
      page: {
        id: pageId,
        siteId
      },
      deleted: false
    },
    select: {
      title: true,
      description: true,
      path: true
    }
  });
}

async function getFormReference(formId: string, siteId: string, environmentId: string, localeCode: string) {
  const form = await prisma.formVersionPublication.findFirst({
    where: {
      environment: {
        id: environmentId
      },
      version: {
        formId
      }
    },
    include: {
      version: true
    }
  });
  if (!form) {
    return null;
  }
  const { version } = form;
  const config = JSON.parse(parseLocalizedInput(version.config, localeCode))
  const tokenData = await createFormVersionToken(version.id, siteId, environmentId, localeCode);
  return {
    id: version.id,
    fields: config.fields || [],
    token: tokenData.id
  };
}

async function getContentBlockReference(contentBlockId: string, siteId: string, environmentId: string, localeCode: string) {
  const contentBlock = await prisma.contentBlockVariantVersionPublication.findFirst({
    where: {
      environment: {
        id: environmentId
      },
      version: {
        localeCode,
        variant: {
          sites: {
            some: {
              siteId: siteId
            }
          },
          contentBlock: {
            id: contentBlockId
          }
        }
      }
    },
    include: {
      version: true
    }
  });
  if (!contentBlock) {
    return null;
  }

  const { version } = contentBlock;
  const content = JSON.parse(version.content);
  return {
    id: contentBlockId,
    slug: version.slug,
    ...content
  };
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

    const [ , type, ids ] = referenceString.split(':');
    const idList = ids.split(',');
    const items = [];
    await Promise.all(
      idList.map(async (id) => {
        if (type === 'page') {
          const page = await getPageReference(id, siteId, environmentId, localeCode);
          if (page) {
            items.push(page);
          }
        } else if (type === 'form') {
          const form = await getFormReference(id, siteId, environmentId, localeCode);
          if (form) {
            items.push(form);
          }
        } else if (type === 'content-block') {
          const contentBlock = await getContentBlockReference(id, siteId, environmentId, localeCode);
          if (contentBlock) {
            items.push(contentBlock);
          }
        }
      })
    );
    let replacement = '[]';
    if (items.length) {
      items.sort((itemA, itemB) => {
        const aIndex = idList.indexOf(itemA.id);
        const bIndex = idList.indexOf(itemB.id);
        if (aIndex > bIndex) return 1;
        if (aIndex < bIndex) return -1;
        return 0;
      });
      replacement = JSON.stringify(items);
    }

    const cutStart = match.index + indexImpact;
    const cutEnd = cutStart + stringMatch.length;

    copy = `${copy.substring(0, cutStart)}${replacement}${copy.substring(cutEnd, copy.length)}`;

    indexImpact += (replacement.length - stringMatch.length);
  }
  copy = parseLocalizedInput(copy, localeCode);
  return copy;
}

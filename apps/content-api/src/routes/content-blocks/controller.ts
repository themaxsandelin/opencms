// Dependencies
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getContentBlockBySlug(slug: string, type: string, siteId: string, environmentId: string, localeCode: string) {
  return prisma.contentBlockVariantVersionPublication.findFirst({
    where: {
      environmentId,
      version: {
        slug,
        localeCode,
        variant: {
          sites: {
            some: {
              siteId
            }
          },
          contentBlock: {
            type,
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
}

export async function getContentBlockParentById(id: string, siteId: string, environmentId: string, localeCode: string) {
  return prisma.contentBlockVariantVersionPublication.findFirst({
    where: {
      environmentId: environmentId,
      version: {
        localeCode,
        variant: {
          sites: {
            some: {
              siteId: siteId
            }
          },
          contentBlock: {
            id
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
}

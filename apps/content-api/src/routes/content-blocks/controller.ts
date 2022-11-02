// Dependencies
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getContentBlockParent(id: string, siteId: string, environmentId: string, localeCode: string) {
  return prisma.contentBlockVariantVersionPublication.findFirst({
    where: {
      environmentId: environmentId,
      version: {
        locale: localeCode,
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

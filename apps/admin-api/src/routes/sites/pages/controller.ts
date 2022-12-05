// Dependencies
import { PrismaClient } from '@prisma/client';

// Controllers
import { siblingPageInstanceExistsWithSlug } from './instances/controller';

const prisma = new PrismaClient();

export async function pageInstanceSlugsAreUniqueOnParentPage(pageId: string, parentPageId: string) {
  const instances = await prisma.pageInstance.findMany({
    where: {
      pageId
    }
  });
  const results = await Promise.all(
    instances.map(async (pageInstance) => siblingPageInstanceExistsWithSlug(parentPageId, pageInstance.localeCode, pageInstance.slug))
  );
  return results.filter(value => value === true).length === 0;
}

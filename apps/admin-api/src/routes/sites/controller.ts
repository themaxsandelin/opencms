// Dependencies
import { PrismaClient, Site } from '@prisma/client';

// Controllers
import { deletePage } from './pages/controller';

const prisma = new PrismaClient();

export async function deleteSite(site: Site, userId: string) {
  const siteRootPages = await prisma.page.findMany({
    where: {
      siteId: site.id,
      parentId: null
    }
  });
  if (siteRootPages.length) {
    // Delete all pages with, including children
    await Promise.all(siteRootPages.map(page => deletePage(page, userId, true)));
  }
  return prisma.site.delete({
    where: {
      id: site.id
    }
  });
}

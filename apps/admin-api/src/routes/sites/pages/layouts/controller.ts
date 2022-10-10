// Dependencies
import { PageLayout, PrismaClient } from '@prisma/client';

// Page layout version controller
import { deletePageLayoutVersion } from './versions/controller';

const prisma = new PrismaClient();

export async function deletePageLayout(pageLayout: PageLayout) {
  const pageLayoutVersions = await prisma.pageLayoutVersion.findMany({
    where: {
      pageLayoutId: pageLayout.id
    }
  });
  if (pageLayoutVersions.length) {
    await Promise.all(
      pageLayoutVersions.map(async (pageLayoutVersion) => deletePageLayoutVersion(pageLayoutVersion))
    );
  }

  await prisma.pageLayout.delete({
    where: {
      id: pageLayout.id
    }
  });
}

// Dependencies
import { PageLayoutVersion, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function deletePageLayoutVersion(pageLayoutVersion: PageLayoutVersion) {
  await prisma.pageLayoutVersionPublication.deleteMany({
    where: {
      versionId: pageLayoutVersion.id
    }
  });

  await prisma.pageLayoutVersion.delete({
    where: {
      id: pageLayoutVersion.id
    }
  });
}

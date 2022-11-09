// Dependencies
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteFormVersionPublications(versionId: string) {
  const publications = await prisma.formVersionPublication.findMany({
    where: {
      versionId
    }
  });
  return Promise.all(
    publications.map(async (publication) => {
      await prisma.formVersionPublication.delete({
        where: {
          id: publication.id
        }
      })
    })
  );
}

export async function deleteFormVersions(formId: string) {
  const versions = await prisma.formVersion.findMany({
    where: {
      formId
    }
  });
  return Promise.all(
    versions.map(async (version) => {
      await deleteFormVersionPublications(version.id);
      await prisma.formVersion.delete({
        where: {
          id: version.id
        }
      })
    })
  );
}

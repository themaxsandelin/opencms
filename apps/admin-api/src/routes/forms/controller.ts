// Dependencies
import { PrismaClient } from '@prisma/client';

// Controllers
import { deleteFormVersions } from './versions/controller';

const prisma = new PrismaClient();

export async function deleteForm(id: string) {
  await deleteFormVersions(id);
  return prisma.form.delete({
    where: {
      id
    }
  });
}

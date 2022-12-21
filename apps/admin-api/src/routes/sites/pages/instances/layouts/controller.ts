// Dependencies
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function deletePageInstanceLayoutByPageLayoutId(pageLayoutId: string, userId: string) {
  const pageInstanceLayouts = await prisma.pageInstanceLayout.findMany({
    where: {
      pageLayoutId
    }
  });
  return Promise.all(
    pageInstanceLayouts.map(
      async (pageInstanceLayout) => {
        await prisma.pageInstanceLayout.delete({
          where: {
            id: pageInstanceLayout.id
          }
        });

        // Log page instance layout deletion.
        await prisma.activityLog.create({
          data: {
            action: 'delete',
            resourceType: 'pageInstanceLayout',
            resourceId: pageInstanceLayout.id,
            createdByUserId: userId
          }
        });
      }
    )
  );
}

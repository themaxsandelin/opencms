// Dependencies
import { PrismaClient, Page } from '@prisma/client';

const prisma = new PrismaClient();

export async function deletePage(rootPage: Page, targetPage: Page, deleteChildren = false) {
  if (rootPage.id === targetPage.id || deleteChildren) {
    // Find any potential children for a given page.
    // We only want to handle the children of a page if we want to delete the children
    // of the "root page", or if we are on the "root page".
    const children = await prisma.page.findMany({
      where: {
        parentId: targetPage.id
      }
    });
    if (children.length) {
      // If there are children, make sure to deal with them first before dealing with the parent page.
      await Promise.all(
        children.map(childPage => deletePage(rootPage, childPage, deleteChildren))
      );
    }
  }
  // If we don't want to delete the children, and are on a child page of the "root page", update that child page to
  // not reference the "root page" as a parent.
  if (!deleteChildren && targetPage.parentId === rootPage.id) {
    return prisma.page.update({
      data: {
        parentId: null
      },
      where: {
        id: targetPage.id
      }
    });
  }
  await prisma.page.delete({
    where: {
      id: targetPage.id
    }
  });
}

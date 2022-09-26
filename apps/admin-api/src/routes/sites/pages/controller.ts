// Dependencies
import { PrismaClient, Page } from '@prisma/client';

const prisma = new PrismaClient();

export async function updateChildPagesPath(path: string, parentId: string) {
  const children = await prisma.page.findMany({
    where: {
      parentId
    },
    include: {
      children: true
    }
  });
  if (children.length) {
    await Promise.all(
      children.map(async childPage => {
        const childPath = `${path}${childPage.slug}`;
        if (childPage.children.length) {
          await updateChildPagesPath(childPath, childPage.id);
        }
        await prisma.page.update({
          data: {
            path: childPath
          },
          where: {
            id: childPage.id
          }
        });
      })
    );
  }
}

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
    // Create a new child prefix path by removing the deleted parent's slug for it's path.
    // This way we cater for the fact that you could delete a 1st level child page, with a parent,
    // and not want to delete the children, and thus remove the page you're deletigns slug from
    // the childrens path.
    const newPrefixPath = rootPage.path.replace(rootPage.slug, '');
    const childPath = targetPage.path.replace(rootPage.path, newPrefixPath);
    // Update the target page's children's paths as well.
    await updateChildPagesPath(childPath, targetPage.id);

    return prisma.page.update({
      data: {
        parentId: null,
        path: childPath
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

// Dependencies
import { PrismaClient, Page } from '@prisma/client';

// Controllers
import { deletePageInstance } from './instances/controller';
import { deletePageLayout } from './layouts/controller';

const prisma = new PrismaClient();

export async function deletePage(page: Page, deleteChildren = false) {
  // First of all, we'll determine if we're delete the children as well.
  // In that case, we'll do that first.
  if (deleteChildren) {
    const children = await prisma.page.findMany({
      where: {
        parentId: page.id
      }
    });
    if (children.length) {
      await Promise.all(
        children.map(async (childPage) => deletePage(childPage, true))
      );
    }
  } else {
    // Otherwise we default to changing all child pages to be children of the given page's
    // parent page, if there is one. Otherwise set it to null.
    const childrenParentId = page.parentId || null;
    await prisma.page.updateMany({
      data: {
        parentId: childrenParentId
      },
      where: {
        parentId: page.id
      }
    });
  }

  // Second of all, we'll delete all instances of the page using it's own utility function.
  const instances = await prisma.pageInstance.findMany({
    where: {
      pageId: page.id,
      path: {
        not: ''
      }
    }
  });
  if (instances.length) {
    await Promise.all(
      instances.map(async (pageInstance) => deletePageInstance(page, pageInstance))
    );
  }

  // Third of all, we'll delete all layouts of the page using it's own utility function.
  const layouts = await prisma.pageLayout.findMany({
    where: {
      pageId: page.id
    }
  });
  if (layouts.length) {
    await Promise.all(
      layouts.map(async (pageLayout) => deletePageLayout(pageLayout))
    );
  }

  // Finally, delete the actual page.
  await prisma.page.delete({
    where: {
      id: page.id
    }
  });
}

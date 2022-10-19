// Dependencies
import { PrismaClient, Page } from '@prisma/client';

// Controllers
import { deletePageInstance, updateAllPageInstancePaths, siblingPageInstanceExistsWithSlug } from './instances/controller';
import { deletePageLayout } from './layouts/controller';

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

export async function deletePage(page: Page, deleteChildren = false) {
  // First of all, we'll determine if we're going to delete the children as well.
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
    const children = await prisma.page.findMany({
      where: {
        parentId: page.id
      }
    });
    // Make sure we can actually update the children by determining if their slugs
    // are unique for the new parent context.
    const childrenResult = await Promise.all(
      children.map(async (childPage) => pageInstanceSlugsAreUniqueOnParentPage(childPage.id, childrenParentId))
    );
    // If there is a false value in the array, that means the slugs in that page are not unique
    // in the parent context. So we should throw an error.
    if (childrenResult.filter(childResult => childResult === false).length > 0) {
      throw new Error('One of the child pages instances have a slug that are not unique in the new parent context. Please manually move the child pages first and then delete this page.');
    }

    // Actually update their parent ID and the slugs and paths.
    await Promise.all(
      children.map(async (childPage) => {
        const updatedChildPage = await prisma.page.update({
          data: {
            parentId: childrenParentId
          },
          where: {
            id: childPage.id
          }
        });
        await updateAllPageInstancePaths({ page: updatedChildPage, changeOfFrontpage: false, changeOfParentPage: true });
      })
    );
  }

  // Second of all, we'll delete all instances of the page using it's own utility function.
  const instances = await prisma.pageInstance.findMany({
    where: {
      pageId: page.id
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

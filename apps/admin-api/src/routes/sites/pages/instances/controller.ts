// Dependencies
import { PrismaClient, Page, PageInstance } from '@prisma/client';

const prisma = new PrismaClient();

async function updateChildPageInstancePaths(page: Page, localeCode: string, path: string) {
  const instance = await prisma.pageInstance.findFirst({
    where: {
      pageId: page.id,
      localeCode
    }
  });
  // Only update children of a page and their instance paths if there is an instance on this page.
  if (instance) {
    const newPath = path ? `${path}${instance.slug}` : '';
    await prisma.pageInstance.update({
      data: {
        path: newPath
      },
      where: {
        id: instance.id
      }
    });
    await updateAllChildPagesInstancePaths(page.id, localeCode, newPath);
  }
}

export async function updateAllChildPagesInstancePaths(parentId: string, localeCode: string, path: string) {
  const childPages = await prisma.page.findMany({
    where: {
      parentId
    }
  });
  return Promise.all(childPages.map(async (childPage) => updateChildPageInstancePaths(childPage, localeCode, path)));
}

export async function updateAllPageInstancePaths({
  page,
  changeOfFrontpage = false,
  changeOfParentPage = false
} : {
  page: Page,
  changeOfFrontpage: boolean,
  changeOfParentPage: boolean
}) {
  const instances = await prisma.pageInstance.findMany({
    where: {
      pageId: page.id
    }
  });

  await Promise.all(
    instances.map(async (pageInstance) => {
      let path = '';
      let slug = pageInstance.slug;
      if (changeOfFrontpage && page.isFrontPage) {
        path = '/';
        slug = '/';
      } else if (changeOfFrontpage && !page.isFrontPage && !changeOfParentPage) {
        path = '';
        slug = '';
      } else if (changeOfParentPage && page.parentId) {
        const parentInstance = await prisma.pageInstance.findFirst({
          where: {
            pageId: page.parentId,
            localeCode: pageInstance.localeCode
          }
        });
        path = parentInstance && parentInstance.path && pageInstance.slug ? `${parentInstance.path}${pageInstance.slug}` : '';
      } else if (changeOfParentPage && !page.parentId) {
        path = slug;
      }
      await prisma.pageInstance.update({
        data: {
          slug,
          path
        },
        where: {
          id: pageInstance.id
        }
      });
    })
  );

  // Make sure to update the child pages instances of the page in question as well.
  if (changeOfParentPage) {
    const childPages = await prisma.page.findMany({
      where: {
        parentId: page.id
      }
    });

    await Promise.all(
      childPages.map(childPage => updateAllPageInstancePaths({ page: childPage, changeOfFrontpage: false, changeOfParentPage }))
    );
  }
}

export async function deletePageInstance(page: Page, pageInstance: PageInstance) {
  let path = '';
  if (page.parentId) {
    const parentInstance = await prisma.pageInstance.findFirst({
      where: {
        pageId: page.parentId,
        localeCode: pageInstance.localeCode
      }
    });
    if (parentInstance) {
      path = parentInstance.path;
    }
  }
  await updateAllChildPagesInstancePaths(page.id, pageInstance.localeCode, path);

  const pageInstanceLayouts = await prisma.pageInstanceLayout.findMany({
    where: {
      pageInstanceId: pageInstance.id
    }
  });

  await Promise.all(
    pageInstanceLayouts.map(async (pageInstanceLayout) => prisma.pageInstanceLayout.delete({
      where: {
        id: pageInstanceLayout.id
      }
    }))
  );

  await prisma.pageInstance.delete({
    where: {
      id: pageInstance.id
    }
  });
}

export async function siblingPageInstanceExistsWithSlug(parentId: string, localeCode: string, slug: string) {
  const siblingPageInstanceWithSlug = await prisma.pageInstance.findFirst({
    where: {
      localeCode,
      slug,
      page: {
        parentId
      }
    }
  });
  return !!siblingPageInstanceWithSlug;
}

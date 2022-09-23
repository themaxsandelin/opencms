// Dependencies
import { PrismaClient } from '@prisma/client';

(async () => {
  const prisma = new PrismaClient();

  let environment = await prisma.publishingEnvironment.findFirst({
    where: {
      key: 'prod'
    }
  });
  if (!environment) {
    environment = await prisma.publishingEnvironment.create({
      data: {
        name: 'Production',
        key: 'prod'
      }
    });
  }

  let site = await prisma.site.findFirst({
    where: {
      key: 'test'
    }
  });
  if (!site) {
    site = await prisma.site.create({
      data: {
        name: 'Test site',
        key: 'test'
      }
    });
  }

  let parentPage = await prisma.page.findFirst({
    where: {
      slug: '/test'
    }
  });
  if (!parentPage) {
    parentPage = await prisma.page.create({
      data: {
        title: 'Test page',
        slug: '/test',
        siteId: site.id
      }
    });
  }


})();

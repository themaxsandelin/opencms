// Dependencies
import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

// Schemas
import { getActivityLogs } from './schema';

// Utils
import { validateRequest } from '@open-cms/shared/utils/index';

const prisma = new PrismaClient();
const router = Router();

router.get('/', validateRequest(getActivityLogs), async (req: Request, res: Response) => {
  try {
    const { search, page } = req.query;
    const take = 20;
    const pageNum = parseInt(page as string);
    const skip = take * (pageNum - 1);

    const activityLogQuery: Prisma.ActivityLogFindManyArgs = {
      take,
      skip,
      where: {},
      include: {
        createdBy: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    };
    const countQuery: Prisma.ActivityLogCountArgs = {
      where: {},
      orderBy: {
        createdAt: 'desc'
      }
    }
    if (search) {
      const where = {
        OR: [
          {
            action: (search as string)
          },
          {
            resourceType: (search as string)
          },
          {
            resourceId: (search as string)
          }
        ]
      };
      countQuery.where = where;
      activityLogQuery.where = {
        ...activityLogQuery.where,
        ...where
      };
    }

    const logs = await prisma.activityLog.findMany(activityLogQuery);
    const total = await prisma.activityLog.count(countQuery);
    const last = Math.ceil(total / take);
    const pagination: { current: number; next?: number; last: number; } = {
      current: pageNum,
      last
    };
    if (pageNum === last) {
      pagination.next = pageNum + 1;
    }

    res.json({ data: logs, pagination });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

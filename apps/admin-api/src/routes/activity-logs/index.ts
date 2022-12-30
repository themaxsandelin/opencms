// Dependencies
import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

// Schemas
import { getActivityLogs } from './schema';

// Shared
import { validateRequest } from '@open-cms/shared/utils/index';

// Utils
import logger from '../../utils/logger';

const prisma = new PrismaClient();
const router = Router();

router.get('/', validateRequest(getActivityLogs, logger), async (req: Request, res: Response) => {
  try {
    const { search, page, sortBy, sort } = req.query;
    const take = 20;
    const pageNum = parseInt(page as string);
    const skip = take * (pageNum - 1);

    const sortByKey = (sortBy as string) || 'createdAt';
    const sortOrder = (sort as string) || 'desc';

    const activityLogQuery: Prisma.ActivityLogFindManyArgs = {
      take,
      skip,
      where: {},
      include: {
        createdBy: true
      },
      orderBy: {}
    };
    const countQuery: Prisma.ActivityLogCountArgs = {
      where: {},
      orderBy: {}
    }
    activityLogQuery.orderBy[sortByKey] = sortOrder;
    countQuery.orderBy[sortByKey] = sortOrder;
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
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

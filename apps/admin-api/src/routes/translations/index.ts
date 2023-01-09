// Dependencies
import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

// Shared
import { validateRequest } from '@open-cms/shared/utils';

// Utils
import logger from '../../utils/logger';

// Data schema
import { createTranslationSchema, updateTranslationSchema } from './schema';

const prisma = new PrismaClient();
const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, page, sortBy, sort } = req.query;
    const take = 20;
    const pageNum = parseInt(page as string);
    const skip = take * (pageNum - 1);

    const sortByKey = (sortBy as string) || 'createdAt';
    const sortOrder = (sort as string) || 'desc';

    const translationQuery: Prisma.TranslationFindManyArgs = {
      take,
      skip,
      where: {},
      include: {
        createdBy: true,
        updatedBy: true
      },
      orderBy: {}
    };
    const countQuery: Prisma.TranslationCountArgs = {
      where: {},
      orderBy: {}
    }
    translationQuery.orderBy[sortByKey] = sortOrder;
    countQuery.orderBy[sortByKey] = sortOrder;
    if (search) {
      const where = {
        OR: [
          {
            key: {
              contains: (search as string)
            }
          },
          {
            value: {
              contains: (search as string)
            }
          }
        ]
      };
      countQuery.where = where;
      translationQuery.where = {
        ...translationQuery.where,
        ...where
      };
    }

    const translations = await prisma.translation.findMany(translationQuery);
    const total = await prisma.translation.count(countQuery);
    const last = Math.ceil(total / take);
    const pagination: { current: number; next?: number; last: number; } = {
      current: pageNum,
      last
    };
    if (pageNum === last) {
      pagination.next = pageNum + 1;
    }

    res.json({
      data: translations.map(translation => {
        translation.value = JSON.parse(translation.value);
        return translation;
      }),
      pagination
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', validateRequest(createTranslationSchema, logger), async (req: Request, res: Response) => {
  try {
    const { key, value, user } = req.body;

    const existingTranslationWithKey = await prisma.translation.findFirst({
      where: {
        key
      }
    });
    if (existingTranslationWithKey) {
      return res.status(400).json({ error: `A translation with the key ${key} already exists.` });
    }

    const translation = await prisma.translation.create({
      data: {
        key,
        value: JSON.stringify(value),
        createdByUserId: user.id,
        updatedByUserId: user.id
      }
    });

    // Log translation creation.
    await prisma.activityLog.create({
      data: {
        action: 'create',
        resourceType: 'translation',
        resourceId: translation.id,
        createdByUserId: user.id
      }
    });

    translation.value = JSON.parse(translation.value);

    res.json({ data: translation });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.use('/:translationId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { translationId: id } = req.params;

    const translation = await prisma.translation.findFirst({
      where: {
        id
      }
    });
    if (!translation) {
      return res.status(404).json({ error: 'Translation not found.' });
    }

    req.body.translation = translation;
    next();
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:translationId', async (req: Request, res: Response) => {
  try {
    const { translation } = req.body;

    res.json({ data: translation });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:translationId', validateRequest(updateTranslationSchema, logger), async (req: Request, res: Response) => {
  try {
    const { key, value, translation, user } = req.body;

    if (key || value) {
      if (key && key !== translation.key) {
        const existingTranslationWithKey = await prisma.translation.findFirst({
          where: {
            key
          }
        });
        if (existingTranslationWithKey) {
          return res.status(400).json({ error: `A translation with the key ${key} already exists.` });
        }
      }

      const updateQuery: Prisma.TranslationUpdateArgs = {
        data: {},
        where: {
          id: translation.id
        }
      };
      if (key) {
        updateQuery.data.key = key;
      }
      if (value) {
        updateQuery.data.value = JSON.stringify(value);
      }

      await prisma.translation.update(updateQuery);

      // Log translation update.
      await prisma.activityLog.create({
        data: {
          action: 'update',
          resourceType: 'translation',
          resourceId: translation.id,
          createdByUserId: user.id
        }
      });

      return res.json({ data: { updated: true } });
    }

    return res.json({ data: { updated: false } });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:translationId', async (req: Request, res: Response) => {
  try {
    const { translation, user } = req.body;

    await prisma.translation.delete({
      where: {
        id: translation.id
      }
    });

    // Log translation deletion.
    await prisma.activityLog.create({
      data: {
        action: 'delete',
        resourceType: 'translation',
        resourceId: translation.id,
        createdByUserId: user.id
      }
    });

    res.json({ data: { deleted: true } });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

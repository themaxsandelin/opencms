// Dependencies
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

// Shared
import { validateRequest } from '@open-cms/shared/utils';

// Utils
import logger from '../../utils/logger';

// Validation schemas
import { createLocaleSchema } from './schema';

// Locale options
import localeOptions from '../../config/locales-options';

const prisma = new PrismaClient();
const router = Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response) => {
  try {
    const locales = await prisma.locale.findMany({
      include: {
        createdBy: true,
        updatedBy: true
      }
    });

    res.json({ data: locales });
  } catch (error) {
    logger.error('Failed to fetch locales', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', validateRequest(createLocaleSchema, logger), async (req: Request, res: Response) => {
  try {
    const { name, code, user } = req.body;
    const existingLocaleByCode = await prisma.locale.findFirst({
      where: {
        code
      }
    });
    if (existingLocaleByCode) {
      return res.status(400).json({ error: `There already exists a locale with the code ${code}.` });
    }

    const locale = await prisma.locale.create({
      data: {
        name,
        code,
        createdByUserId: user.id,
        updatedByUserId: user.id,
      }
    });

    // Log locale creation.
    await prisma.activityLog.create({
      data: {
        action: 'create',
        resourceType: 'locale',
        resourceId: locale.id,
        createdByUserId: user.id
      }
    });

    res.json({ data: locale });
  } catch (error) {
    logger.error('Failed to add new locale', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/options', async (req: Request, res: Response) => {
  try {
    const locales = await prisma.locale.findMany();

    res.json({
      data: localeOptions.filter(localeOption => !locales.find(locale => locale.code === localeOption.code))
    });
  } catch (error) {
    logger.error('Failed to get locale options', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

// Dependencies
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

// Shared
import { validateRequest } from '@open-cms/shared/utils';

// Utils
import logger from '../../utils/logger';

// Validation schemas
import { queryPagesSchema } from './schema';

const prisma = new PrismaClient();
const router = Router();

router.get('/', validateRequest(queryPagesSchema, logger), async (req: Request, res: Response) => {
  try {
    const { selectedLocale } = req.body;
    const translations = await prisma.translation.findMany({
      where: {
        value: {
          contains: selectedLocale.code
        }
      }
    });

    res.json({
      data: translations.reduce((result, translation) => {
        const { key, value } = translation;
        const data = JSON.parse(value)

        result[key] = data.values[selectedLocale.code];
        return result;
      }, {})
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

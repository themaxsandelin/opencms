// Dependencies
import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

// Controllers
import { deleteForm } from './controller';

// Utils
import { validateRequest } from '@open-cms/shared/utils';

// Schemas
import { createFormSchema, patchFormSchema } from './schema';

// Sub routers
import VersionsRouter from './versions';
import SubmissionsRouter from './submissions';

const prisma = new PrismaClient();
const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const forms = await prisma.form.findMany({
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return res.json({ data: forms });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', validateRequest(createFormSchema), async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const form = await prisma.form.create({
      data: {
        name
      }
    });

    res.json({ data: form });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.use('/:formId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { formId } = req.params;
    const form = await prisma.form.findFirst({
      where: {
        id: formId
      }
    });
    if (!form) {
      return res.status(404).json({ error: 'Form not found.' });
    }

    req.body.form = form;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:formId', (req: Request, res: Response) => {
  try {
    const { form } = req.body;

    res.json({ data: form });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:formId', validateRequest(patchFormSchema), async (req: Request, res: Response) => {
  try {
    const { formId } = req.params;
    const { name } = req.body;

    await prisma.form.update({
      data: {
        name
      },
      where: {
        id: formId
      }
    });

    res.json({ data: { updated: true } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:formId', async (req: Request, res: Response) => {
  try {
    const { formId } = req.params;

    await deleteForm(formId);

    res.json({ data: { deleted: true } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.use('/:formId/versions', VersionsRouter);
router.use('/:formId/submissions', SubmissionsRouter);

export default router;

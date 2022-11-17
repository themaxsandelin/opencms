// Dependencies
import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response) => {
  try {
    const { formId } = req.params;
    const submissions = await prisma.formVersionSubmission.findMany({
      where: {
        version: {
          formId
        }
      },
      include: {
        environment: true,
        site: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      data: submissions.map(submission => ({
        ...submission,
        data: JSON.parse(submission.data)
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.use('/:submissionId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { formId, submissionId } = req.params;
    const submission = await prisma.formVersionSubmission.findFirst({
      where: {
        id: submissionId,
        version: {
          formId
        }
      },
      include: {
        environment: true,
        site: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    req.body.formSubmission = {
      ...submission,
      data: JSON.parse(submission.data)
    };
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:submissionId', async (req: Request, res: Response) => {
  try {
    const { formSubmission } = req.body;
    res.json({ data: formSubmission });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

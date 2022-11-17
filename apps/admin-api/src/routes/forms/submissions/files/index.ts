// Dependencies
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { NextFunction, Request, Response, Router } from 'express';

// Load local env variables.
const { parsed: env } = dotenv.config();

const uploadDir = env ? env.UPLOAD_DIR : process.env.UPLOAD_DIR;
if (!uploadDir) {
  console.error('You have to define an upload directory using the environment variable UPLOAD_DIR.');
  process.exit(0);
}

const prisma = new PrismaClient();
const router = Router({ mergeParams: true });

router.use('/:fileId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileId, submissionId } = req.params;
    const file = await prisma.formVersionSubmissionFile.findFirst({
      where: {
        id: fileId,
        submissionId
      }
    });
    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    req.body.formSubmissionFile = file;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:fileId', async (req: Request, res: Response) => {
  try {
    const { formSubmissionFile } = req.body;

    res.json({ data: formSubmissionFile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:fileId/file', async (req: Request, res: Response) => {
  try {
    const { formSubmissionFile, formSubmission } = req.body;
    const options = {
      root: `${uploadDir}/submissions/${formSubmission.id}`,
      headers: {
        'Content-Type': formSubmissionFile.mimeType
      }
    };

    res.sendFile(formSubmissionFile.id, options, (error) => {
      if (error) {
        console.error('Form submission file could not be read.', error);
        return res.status(404).json({ error: 'File not found' });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

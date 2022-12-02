// Dependencies
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import dotenv from 'dotenv';

// Utils
import { validateRequest } from '@open-cms/shared/utils';

// Schemas
import { formSubmissionSchema } from './schema';

// Controller
import { getPublishedFormVersion, validateFormData, validateSubmissionFiles, handleSubmissionFiles, deleteRequestFiles, validateFormToken, deleteFormToken } from './controller';

// Load local env variables.
const { parsed: env } = dotenv.config();

const uploadDir = "/data"
// temp fix
//= env ? env.UPLOAD_DIR : process.env.UPLOAD_DIR;
if (!uploadDir) {
  console.error('You have to define an upload directory using the environment variable UPLOAD_DIR.');
  process.exit(0);
}

const router = Router();
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, `${uploadDir}/uploads`);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now() + '-' + Math.round(Math.random() * 100000000)}`);
  },
});
const upload = multer({
  storage,
  limits: {},
});

router.post('/:id', [validateRequest(formSubmissionSchema), upload.array('files[]')], async (req: Request, res: Response) => {
  try {
    const { selectedLocale, publishingEnvironment, site } = req.body;
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];

    const publishedFormVersion = await getPublishedFormVersion(id, publishingEnvironment.id);
    if (!publishedFormVersion) {
      await deleteRequestFiles(files);
      return res.status(400).json({ error: 'Unknown form.' });
    }

    const token = (req.headers['x-form-token'] as string);
    const validToken = await validateFormToken(token, site.id, publishingEnvironment.id, selectedLocale.code);
    if (!validToken) {
      await deleteRequestFiles(files);
      return res.status(400).json({ error: 'Invalid token.' });
    }

    const { valid, cause, fieldKey, data: formData } = await validateFormData(req.body, publishedFormVersion.version);
    if (!valid) {
      await deleteRequestFiles(files);
      return res.status(400).json({ error: 'Invalid form submission', details: { cause, fieldKey } });
    }

    const { valid: validFiles, cause: validFilesCause, fieldKey: validFilesKey } = await validateSubmissionFiles(files, publishedFormVersion.version);
    if (!validFiles) {
      await deleteRequestFiles(files);
      return res.status(400).json({ error: 'Invalid form submission', details: { cause: validFilesCause, fieldKey: validFilesKey } });
    }

    const submission = await prisma.formVersionSubmission.create({
      data: {
        data: JSON.stringify(formData),
        versionId: id,
        localeCode: selectedLocale.code,
        environmentId: publishingEnvironment.id,
        siteId: site.id
      }
    });

    await handleSubmissionFiles(files, submission, uploadDir);
    await deleteFormToken(token);

    res.json({ data: { submitted: true } });
  } catch (error) {
    // Ensure we delete any uploaded files in the case of a failed request.
    const files = req.files as Express.Multer.File[];
    await deleteRequestFiles(files);

    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

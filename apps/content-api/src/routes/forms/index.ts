// Dependencies
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';

// Schemas
import { formSubmissionSchema } from './schema';

// Controllers
import { getPreviouslyPublishedFormVersion, getFormOnPagesByPath, validateFormData, validateSubmissionFiles, handleSubmissionFiles, deleteRequestFiles, validateFormToken, deleteFormToken } from './controller';
import { createFormVersionToken } from '../content/controller';

// Shared
import { validateRequest } from '@open-cms/shared/utils';

// Utils

// Utils
import logger from '../../utils/logger';

// Workaround NX overwriting env variables at build time.
const env = {...process}.env;
const uploadDir = env.UPLOAD_DIR;
if (!uploadDir) {
  logger.error('You have to define an upload directory using the environment variable UPLOAD_DIR.');
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

router.post('/:id', [upload.array('files[]'), validateRequest(formSubmissionSchema, logger)], async (req: Request, res: Response) => {
  try {
    const { pagePath } = req.query;
    const { selectedLocale, publishingEnvironment, site } = req.body;
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];

    const formVersion = await getPreviouslyPublishedFormVersion(id);
    if (!formVersion) {
      await deleteRequestFiles(files);
      logger.warn(`Invalid form submission: Unknown form version ${formVersion}`);
      return res.status(404).json({ error: 'Unknown form.' });
    }

    const token = (req.headers['x-form-token'] as string);
    const validToken = await validateFormToken(token, site.id, publishingEnvironment.id, selectedLocale.code);
    if (!validToken) {
      await deleteRequestFiles(files);
      logger.warn(`Invalid form submission: Bad token ${token}`);
      return res.status(400).json({ error: 'Invalid token.' });
    }

    const pages = await getFormOnPagesByPath((pagePath as string), formVersion.formId, site.id, publishingEnvironment.id, selectedLocale.code);
    if (!pages) {
      await deleteRequestFiles(files);
      logger.warn(`Invalid form submission: Form not found on page ${pagePath}, form ${formVersion.formId} for env ${publishingEnvironment.id} and locale ${selectedLocale.code}`);
      return res.status(404).json({ error: 'Invalid form submission', details: { cause: 'Form not found on page.' } });
    }

    const { valid, cause, fieldKey, data: formData } = await validateFormData(req.body, formVersion);
    if (!valid) {
      await deleteRequestFiles(files);
      logger.warn(`Invalid form submission: '${cause}' '${fieldKey}'`);
      return res.status(400).json({ error: 'Invalid form submission', details: { cause, fieldKey } });
    }

    const { valid: validFiles, cause: validFilesCause, fieldKey: validFilesKey, status } = await validateSubmissionFiles(files, formVersion);
    if (!validFiles) {
      await deleteRequestFiles(files);
      logger.warn(`Invalid form submission: '${validFilesCause}' '${validFilesKey}'`);
      return res.status(status).json({ error: 'Invalid form submission', details: { cause: validFilesCause, fieldKey: validFilesKey } });
    }

    formData.dynamic = {};
    pages.forEach((page, i) => {
      formData.dynamic[`page-${i}`] = page.title;
    });

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

    // Generate a new token for the form to be resubmitted.
    const newToken = await createFormVersionToken(formVersion.id, site.id, publishingEnvironment.id, selectedLocale.code);

    res.json({ data: { submitted: true, token: newToken.id } });
  } catch (error) {
    // Ensure we delete any uploaded files in the case of a failed request.
    const files = req.files as Express.Multer.File[];
    await deleteRequestFiles(files);

    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

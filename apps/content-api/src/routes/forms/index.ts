// Dependencies
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import dotenv from 'dotenv';

// Utils
// import { validateRequest } from '@open-cms/shared/utils';
import locales from '@open-cms/shared/locales';

// Controller
import { validateFormSubmission, handleSubmissionFiles, deleteRequestFiles } from './controller';

// Load local env variables.
const { parsed: env } = dotenv.config();

const uploadDir = env ? env.UPLOAD_DIR : process.env.UPLOAD_DIR;
if (!uploadDir) {
  console.error('You have to define an upload directory using the environment variable UPLOAD_DIR.');
  process.exit(0);
}

const router = Router();
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now() + '-' + Math.round(Math.random() * 100000000)}`);
  },
});
const upload = multer({
  storage,
  limits: {},
});

router.post('/:id', upload.array('files[]'), async (req: Request, res: Response) => {
  try {
    const { environment, locale, site: siteKey } = req.query;
    const { id } = req.params;

    const selectedLocale = locales.find(localeObj => localeObj.code.toLowerCase() === (locale as string).toLowerCase());
    if (!selectedLocale) {
      return res.status(400).json({ error: `The provided locale code ${locale} is not valid.` });
    }

    const publishingEnvironment = await prisma.publishingEnvironment.findFirst({
      where: {
        key: (environment as string)
      }
    });
    if (!publishingEnvironment) {
      return res.status(400).json({ error: 'Invalid or unknown environment key.' });
    }

    const site = await prisma.site.findFirst({
      where: {
        key: (siteKey as string)
      }
    });
    if (!site) {
      return res.status(400).json({ error: `Could not find a site with the key ${siteKey}` });
    }

    const { valid, cause, fieldKey, data: formData } = await validateFormSubmission(id, req.body, publishingEnvironment.id);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid form submission', details: { cause, fieldKey } });
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

    const files = req.files as Express.Multer.File[];
    await handleSubmissionFiles(files, submission, uploadDir);

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

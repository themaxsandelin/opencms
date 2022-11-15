// Dependencies
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

// Utils
// import { validateRequest } from '@open-cms/shared/utils';
import locales from '@open-cms/shared/locales';

// Controller
import { validateFormSubmission } from './controller';

const router = Router();
const prisma = new PrismaClient();

router.post('/:id', async (req: Request, res: Response) => {
  try {
    const { environment, locale, site: siteKey } = req.query;
    const { id } = req.params;
    const { data } = req.body;

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

    const { valid, cause, fieldKey, data: formData } = await validateFormSubmission(id, data, publishingEnvironment.id);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid form submission', details: { cause, fieldKey } });
    }

    await prisma.formVersionSubmissions.create({
      data: {
        data: JSON.stringify(formData),
        versionId: id,
        localeCode: selectedLocale.code,
        environmentId: publishingEnvironment.id,
        siteId: site.id
      }
    });

    res.json({ data: { submitted: true } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

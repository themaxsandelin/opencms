// Dependencies
import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

// Utils
import { validateRequest } from '@open-cms/shared/utils/index';

// Schemas
import { versionPublishSchema } from './schema';

const prisma = new PrismaClient();
const router = Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response) => {
  try {
    const { formId } = req.params;
    const versions = await prisma.formVersion.findMany({
      where: {
        formId
      },
      include: {
        publications: {
          include: {
            environment: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    res.json({
      data: versions.map(version => ({
        ...version,
        config: JSON.parse(version.config)
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { formId } = req.params;
    const { config, user } = req.body;

    const version = await prisma.formVersion.create({
      data: {
        formId,
        config: JSON.stringify(config),
        createdByUserId: user.id,
        updatedByUserId: user.id,
      }
    });

    res.json({ data: version });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.use('/:versionId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { versionId, formId } = req.params;
    const version = await prisma.formVersion.findFirst({
      where: {
        id: versionId,
        formId
      }
    });
    if (!version) {
      return res.status(404).json({ error: 'Form version not found.' });
    }

    req.body.formVersion = version;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:versionId', async (req: Request, res: Response) => {
  try {
    const { formVersion } = req.body;

    res.json({ data: formVersion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:versionId', async (req: Request, res: Response) => {
  try {
    const { formVersion, user } = req.body;
    if (formVersion.wasPublished) {
      return res.status(400).json({ error: 'Cannot update a version that has been published.' });
    }

    const { config } = req.body;
    await prisma.formVersion.update({
      data: {
        config: JSON.stringify(config),
        updatedByUserId: user.id,
      },
      where: {
        id: formVersion.id
      }
    });

    res.json({ data: { updated: true } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/:versionId/publish', validateRequest(versionPublishSchema), async (req: Request, res: Response) => {
  try {
    const { formId } = req.params;
    const { environment: environmentId, formVersion, user } = req.body;

    const publishingEnvironment = await prisma.publishingEnvironment.findFirst({
      where: {
        id: environmentId
      }
    });
    if (!publishingEnvironment) {
      return res.status(404).json({ error: `Could not find a publishing environment with the ID ${environmentId}.` });
    }

    const existingPublication = await prisma.formVersionPublication.findFirst({
      where: {
        environmentId: publishingEnvironment.id,
        version: {
          formId
        }
      }
    });
    if (existingPublication) {
      // If the current publication exists and is the same version that is targeted, do not publish again.
      if (existingPublication.versionId === formVersion.id) {
        return res.status(400).json({ error: 'This form version is already published to the provided environment.' });
      }
      // Otherwise, update the current publication to the new version.
      await prisma.formVersionPublication.update({
        data: {
          versionId: formVersion.id,
          createdByUserId: user.id,
          updatedByUserId: user.id,
        },
        where: {
          id: existingPublication.id
        }
      });
    } else {
      // If no publication on the given environment has been made for this form,
      // publish the provided version as expected.
      await prisma.formVersionPublication.create({
        data: {
          versionId: formVersion.id,
          environmentId: publishingEnvironment.id,
          createdByUserId: user.id,
          updatedByUserId: user.id,
        }
      });
    }

    // Ensure that the form version has the prop wasPublished set to true whenever it's published.
    if (!formVersion.wasPublished) {
      await prisma.formVersion.update({
        data: {
          wasPublished: true,
          updatedByUserId: user.id,
        },
        where: {
          id: formVersion.id
        }
      });
    }

    res.json({ data: { published: true } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

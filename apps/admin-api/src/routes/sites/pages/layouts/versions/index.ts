// Dependencies
import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

// Utils
import { validateRequest } from '@open-cms/utils';

// Validation schema
import { createVersionSchema, publishVersionSchema } from './schema';

const prisma = new PrismaClient();
const router = Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response) => {
  try {
    const { pageLayout } = req.body;
    const versions = await prisma.pageLayoutVersion.findMany({
      where: {
        pageLayoutId: pageLayout.id
      }
    });
    return res.json(versions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as any).message });
  }
});

router.post('/', validateRequest(createVersionSchema), async (req: Request, res: Response) => {
  try {
    const { content, pageLayout } = req.body;
    const version = await prisma.pageLayoutVersion.create({
      data: {
        content: JSON.stringify(content),
        pageLayoutId: pageLayout.id
      }
    });
    res.json(version);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as any).message });
  }
});

router.use('/:versionId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { versionId } = req.params;
    const pageLayoutVersion = await prisma.pageLayoutVersion.findFirst({
      where: {
        id: versionId
      }
    });
    if (!pageLayoutVersion) {
      return res.status(404).json({ error: `Could not find page layout version by id ${versionId}` });
    }

    req.body.pageLayoutVersion = pageLayoutVersion;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as any).message });
  }
});

router.get('/:versionId', async (req: Request, res: Response) => {
  try {
    const { pageLayoutVersion } = req.body;
    res.json(pageLayoutVersion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as any).message });
  }
});

router.post('/:versionId/publish', validateRequest(publishVersionSchema), async (req: Request, res: Response) => {
  try {
    const { environment: environmentId, pageLayoutVersion, page } = req.body;

    const publishingEnvironment = await prisma.publishingEnvironment.findFirst({
      where: {
        id: environmentId
      }
    });
    if (!publishingEnvironment) {
      return res.status(404).json({ error: `Could not find a publishing environment with the ID ${environmentId}.` });
    }

    const existingPublication = await prisma.pageLayoutVersionPublication.findFirst({
      where: {
        environmentId: publishingEnvironment.id,
        version: {
          layout: {
            page: {
              id: page.id
            }
          }
        }
      }
    });
    if (existingPublication) {
      // If the current publication exists and is the same version that is targeted, do not publish again.
      if (existingPublication.versionId === pageLayoutVersion.id) {
        return res.status(400).json({ error: 'This page layout version is already published to the provided environment.' });
      }
      // Otherwise, update the current publication to the new version.
      await prisma.pageLayoutVersionPublication.update({
        data: {
          versionId: pageLayoutVersion.id
        },
        where: {
          id: existingPublication.id
        }
      });
    } else {
      await prisma.pageLayoutVersionPublication.create({
        data: {
          versionId: pageLayoutVersion.id,
          environmentId: publishingEnvironment.id,
        }
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: (error as any).message });
  }
});

export default router;

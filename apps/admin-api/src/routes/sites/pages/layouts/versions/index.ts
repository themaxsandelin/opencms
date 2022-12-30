// Dependencies
import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

// Utils
import logger from '../../../../../utils/logger';
import { validateRequest } from '@open-cms/shared/utils';

// Validation schema
import { publishVersionSchema } from './schema';

const prisma = new PrismaClient();
const router = Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response) => {
  try {
    const { pageLayout } = req.body;
    const versions = await prisma.pageLayoutVersion.findMany({
      where: {
        pageLayoutId: pageLayout.id
      },
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        publications: {
          include: {
            environment: true
          }
        }
      }
    });

    return res.json({
      data: versions.map(version => ({
        ...version,
        content: JSON.parse(version.content)
      }))
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { content, pageLayout, user } = req.body;
    const version = await prisma.pageLayoutVersion.create({
      data: {
        content: JSON.stringify(content),
        pageLayoutId: pageLayout.id,
        createdByUserId: user.id,
        updatedByUserId: user.id,
      }
    });

    // Log page layout version creation.
    await prisma.activityLog.create({
      data: {
        action: 'create',
        resourceType: 'pageLayoutVersion',
        resourceId: version.id,
        createdByUserId: user.id
      }
    });

    res.json({ data: version });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
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
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:versionId', async (req: Request, res: Response) => {
  try {
    const { pageLayoutVersion } = req.body;
    res.json({ data: pageLayoutVersion });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:versionId', async (req: Request, res: Response) => {
  try {
    const { content, pageLayoutVersion, user } = req.body;

    if (pageLayoutVersion.wasPublished) {
      return res.status(400).json({ error: 'You cannot update a page layout version that has been published to an environment.' });
    }

    await prisma.pageLayoutVersion.update({
      data: {
        content: JSON.stringify(content),
        updatedByUserId: user.id,
      },
      where: {
        id: pageLayoutVersion.id
      }
    });

    // Log page layout version update.
    await prisma.activityLog.create({
      data: {
        action: 'update',
        resourceType: 'pageLayoutVersion',
        resourceId: pageLayoutVersion.id,
        createdByUserId: user.id
      }
    });

    res.json({ data: { updated: true } });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/:versionId/publish', validateRequest(publishVersionSchema, logger), async (req: Request, res: Response) => {
  try {
    const { environment: environmentId, pageLayoutVersion, pageLayout, user } = req.body;

    const publishingEnvironment = await prisma.publishingEnvironment.findFirst({
      where: {
        id: environmentId
      }
    });
    if (!publishingEnvironment) {
      return res.status(404).json({ error: `Could not find a publishing environment with the ID ${environmentId}.` });
    }

    const existingPublications = await prisma.pageLayoutVersionPublication.findMany({
      where: {
        environmentId: publishingEnvironment.id,
        version: {
          layout: {
            id: pageLayout.id
          }
        }
      }
    });
    if (existingPublications.length) {
      const versionIsPublished = existingPublications.find(publication => publication.versionId === pageLayoutVersion.id);
      if (versionIsPublished) {
        return res.status(400).json({ error: 'This page layout version is already published to the provided environment.' });
      }

      // Delete old publications from other versions.
      await Promise.all(
        existingPublications.map(async (publication) => {
          await prisma.pageLayoutVersionPublication.delete({
            where: {
              id: publication.id
            }
          });
        })
      );
    }

    await prisma.pageLayoutVersionPublication.create({
      data: {
        versionId: pageLayoutVersion.id,
        environmentId: publishingEnvironment.id,
        createdByUserId: user.id,
        updatedByUserId: user.id,
      }
    });

    if (!pageLayoutVersion.wasPublished) {
      await prisma.pageLayoutVersion.update({
        data: {
          wasPublished: true,
          updatedByUserId: user.id,
        },
        where: {
          id: pageLayoutVersion.id
        }
      });
    }

    // Log page layout version publishing.
    await prisma.activityLog.create({
      data: {
        action: 'update',
        resourceType: 'pageLayoutVersion',
        resourceId: pageLayoutVersion.id,
        detailText: `Published to ${publishingEnvironment.name}.`,
        createdByUserId: user.id
      }
    });

    res.json({ data: { published: true } });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

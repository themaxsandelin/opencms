// Dependencies
import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

// Utils
import { validateVersionCreationRequest, validateVersionPatchRequest, validateVersionPublicationRequest } from './validate';

const prisma = new PrismaClient();
const router = Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response) => {
  try {
    const { localeCode } = req.query;
    const { contentBlockVariant } = req.body;

    const versions = await prisma.contentBlockVariantVersion.findMany({
      where: {
        contentBlockVariantId: contentBlockVariant.id,
        localeCode: localeCode ? (localeCode as string) : {
          not: undefined
        }
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
      data: versions.map((version) => ({
        ...version,
        content: JSON.parse(version.content)
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', validateVersionCreationRequest, async (req: Request, res: Response) => {
  try {
    const { content, localeCode, slug, contentBlockVariant, user } = req.body;

    const locale = await prisma.locale.findFirst({
      where: {
        code: localeCode
      }
    });
    if (!locale) {
      return res.status(400).json({ error: `The locale code ${localeCode} does not exist in the system.` });
    }

    const version = await prisma.contentBlockVariantVersion.create({
      data: {
        content: JSON.stringify(content),
        localeCode,
        slug,
        contentBlockVariantId: contentBlockVariant.id,
        createdByUserId: user.id,
        updatedByUserId: user.id,
      }
    });

    // Log content block variant version creation.
    await prisma.activityLog.create({
      data: {
        action: 'create',
        resourceType: 'contentBlockVariantVersion',
        resourceId: version.id,
        createdByUserId: user.id
      }
    });

    version.content = JSON.parse(version.content);
    return res.json({ data: version });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.use('/:versionId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { versionId } = req.params;
    const contentBlockVariantVersion = await prisma.contentBlockVariantVersion.findFirst({
      where: {
        id: versionId
      }
    });
    if (!contentBlockVariantVersion) {
      return res.status(404).json({ error: 'Content block variant version not found.' });
    }

    req.body.contentBlockVariantVersion = contentBlockVariantVersion;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:versionId', async (req: Request, res: Response) => {
  try {
    const { contentBlockVariantVersion } = req.body;

    res.json({ data: contentBlockVariantVersion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:versionId', validateVersionPatchRequest, async (req: Request, res: Response) => {
  try {
    const { content, slug, contentBlockVariantVersion, user } = req.body;

    if (contentBlockVariantVersion.wasPublished) {
      return res.status(400).json({ error: 'You cannot update a content block variant version that has been published.' });
    }

    await prisma.contentBlockVariantVersion.update({
      data: {
        content: JSON.stringify(content),
        slug,
        updatedByUserId: user.id,
      },
      where: {
        id: contentBlockVariantVersion.id
      }
    });

    // Log content block variant version update.
    await prisma.activityLog.create({
      data: {
        action: 'update',
        resourceType: 'contentBlockVariantVersion',
        resourceId: contentBlockVariantVersion.id,
        createdByUserId: user.id
      }
    });

    res.json({ data: { updated: true } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/:versionId/publish', validateVersionPublicationRequest(), async (req: Request, res: Response) => {
  try {
    const { environment: environmentId, contentBlock, contentBlockVariantVersion, user } = req.body;

    const publishingEnvironment = await prisma.publishingEnvironment.findFirst({
      where: {
        id: environmentId
      }
    });
    if (!publishingEnvironment) {
      return res.status(404).json({ error: `Could not find a publishing environment with the ID ${environmentId}.` });
    }

    const existingPublications = await prisma.contentBlockVariantVersionPublication.findMany({
      where: {
        environmentId: publishingEnvironment.id,
        version: {
          localeCode: contentBlockVariantVersion.localeCode,
          variant: {
            contentBlock: {
              id: contentBlock.id
            }
          }
        }
      }
    });
    if (existingPublications.length) {
      const versionIsPublished = existingPublications.find(publication => publication.versionId === contentBlockVariantVersion.id);
      if (versionIsPublished) {
        return res.status(400).json({ error: 'This content block variant version is already published to the provided environment.' });
      }

      // Delete old publications from other versions.
      await Promise.all(
        existingPublications.map(async (publication) => {
          await prisma.contentBlockVariantVersionPublication.delete({
            where: {
              id: publication.id
            }
          });
        })
      );
    }

    await prisma.contentBlockVariantVersionPublication.create({
      data: {
        versionId: contentBlockVariantVersion.id,
        environmentId: publishingEnvironment.id,
        createdByUserId: user.id,
        updatedByUserId: user.id,
      }
    });

    // Ensure that the content block variant version has the prop wasPublished set to true whenever it's published.
    if (!contentBlockVariantVersion.wasPublished) {
      await prisma.contentBlockVariantVersion.update({
        data: {
          wasPublished: true,
          updatedByUserId: user.id,
        },
        where: {
          id: contentBlockVariantVersion.id
        }
      });
    }

    // Log content block variant version publishing.
    await prisma.activityLog.create({
      data: {
        action: 'publish',
        resourceType: 'contentBlockVariantVersion',
        resourceId: contentBlockVariantVersion.id,
        detailText: `Published to ${publishingEnvironment.name}.`,
        createdByUserId: user.id
      }
    });

    res.json({ data: { published: true } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

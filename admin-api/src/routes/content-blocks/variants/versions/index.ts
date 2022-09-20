// Dependencies
import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

// Utils
import { validateVersionCreationRequest, validateVersionPublicationRequest } from './validate';

const prisma = new PrismaClient();
const router = Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response) => {
  try {
    const { contentBlockVariant } = req.body;

    const versions = await prisma.contentBlockVariantVersion.findMany({
      where: {
        contentBlockVariantId: contentBlockVariant.id
      }
    });
    res.json(
      versions.map((version) => ({
        ...version,
        content: JSON.parse(version.content)
      }))
    );
  } catch (error) {
    res.status(500).json({ error: JSON.stringify(error) });
  }
});

router.post('/', validateVersionCreationRequest, async (req: Request, res: Response) => {
  try {
    const { content, locale, contentBlockVariant } = req.body;

    const version = await prisma.contentBlockVariantVersion.create({
      data: {
        content: JSON.stringify(content),
        locale,
        contentBlockVariantId: contentBlockVariant.id
      }
    });

    version.content = JSON.parse(version.content);
    return res.json(version);
  } catch (error) {
    res.status(500).json({ error: JSON.stringify(error) });
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
    res.status(500).json({ error: JSON.stringify(error) });
  }
});

router.get('/:versionId', async (req: Request, res: Response) => {
  res.json(req.body.contentBlockVariantVersion);
});

router.post('/:versionId/publish', validateVersionPublicationRequest(), async (req: Request, res: Response) => {
  try {
    const { environment: environmentId, contentBlock, contentBlockVariantVersion } = req.body;

    const publishingEnvironment = await prisma.publishingEnvironment.findFirst({
      where: {
        id: environmentId
      }
    });
    if (!publishingEnvironment) {
      return res.status(404).json({ error: `Could not find a publishing environment with the ID ${environmentId}.` });
    }

    const existingPublication = await prisma.contentBlockVariantVersionPublication.findFirst({
      where: {
        environmentId: publishingEnvironment.id,
        version: {
          variant: {
            contentBlock: {
              id: contentBlock.id
            }
          }
        }
      }
    });
    if (existingPublication) {
      // If the current publication exists and is the same version that is targeted, do not publish again.
      if (existingPublication.versionId === contentBlockVariantVersion.id) {
        return res.status(400).json({ error: 'This content block variant version is already published to the provided environment.' });
      }
      // Otherwise, update the current publication to the new version.
      await prisma.contentBlockVariantVersionPublication.update({
        data: {
          versionId: contentBlockVariantVersion.id
        },
        where: {
          id: existingPublication.id
        }
      });
    } else {
      // If no publication on the given environment has been made for this content block,
      // publish the provided version as expected.
      await prisma.contentBlockVariantVersionPublication.create({
        data: {
          versionId: contentBlockVariantVersion.id,
          environmentId: publishingEnvironment.id
        }
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: JSON.stringify(error) });
  }
});

export default router;

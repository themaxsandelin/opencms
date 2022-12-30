// Dependencies
import { Request, Response, NextFunction } from 'express';

// Shared
import { validateRequest } from '@open-cms/shared/utils';

// Utils
import logger from '../../../../utils/logger';

// Validation schemas
import { createQuestionVersionSchema, createQuestionCategoryVersionSchema, patchQuestionVersionSchema, patchQuestionCategoryVersionSchema, versionPublishSchema } from './schema';

export function validateVersionCreationRequest(req: Request, res: Response, next: NextFunction) {
  const { contentBlock } = req.body;
  if (contentBlock.type === 'question') {
    return validateRequest(createQuestionVersionSchema, logger)(req, res, next);
  } else if (contentBlock.type === 'question-category') {
    return validateRequest(createQuestionCategoryVersionSchema, logger)(req, res, next);
  }
  return res.status(400).json({ error: 'Unknown content block type.' });
}

export function validateVersionPatchRequest(req: Request, res: Response, next: NextFunction) {
  const { contentBlock } = req.body;
  if (contentBlock.type === 'question') {
    return validateRequest(patchQuestionVersionSchema, logger)(req, res, next);
  } else if (contentBlock.type === 'question-category') {
    return validateRequest(patchQuestionCategoryVersionSchema, logger)(req, res, next);
  }
  return res.status(400).json({ error: 'Unknown content block type.' });
}

export function validateVersionPublicationRequest() {
  return validateRequest(versionPublishSchema, logger);
}

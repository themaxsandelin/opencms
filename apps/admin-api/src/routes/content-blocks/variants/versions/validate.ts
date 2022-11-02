// Dependencies
import { Request, Response, NextFunction } from 'express';

// Utils
import { validateRequest } from '@open-cms/shared/utils';

// Validation schemas
import { createQuestionVersionSchema, createQuestionCategoryVersionSchema, patchQuestionVersionSchema, patchQuestionCategoryVersionSchema, versionPublishSchema } from './schema';

export function validateVersionCreationRequest(req: Request, res: Response, next: NextFunction) {
  const { contentBlock } = req.body;
  if (contentBlock.type === 'question') {
    return validateRequest(createQuestionVersionSchema)(req, res, next);
  } else if (contentBlock.type === 'question-category') {
    return validateRequest(createQuestionCategoryVersionSchema)(req, res, next);
  }
  return res.status(400).json({ error: 'Unknown content block type.' });
}

export function validateVersionPatchRequest(req: Request, res: Response, next: NextFunction) {
  const { contentBlock } = req.body;
  if (contentBlock.type === 'question') {
    return validateRequest(patchQuestionVersionSchema)(req, res, next);
  } else if (contentBlock.type === 'question-category') {
    return validateRequest(patchQuestionCategoryVersionSchema)(req, res, next);
  }
  return res.status(400).json({ error: 'Unknown content block type.' });
}

export function validateVersionPublicationRequest() {
  return validateRequest(versionPublishSchema);
}

// Dependencies
import { Request, Response, NextFunction } from 'express';

// Utils
import { validateRequest } from '@/utils/validation';

// Validation schemas
import { createQuestionVersionSchema, versionPublishSchema } from './schema';

export function validateVersionCreationRequest(req: Request, res: Response, next: NextFunction) {
  const { contentBlock } = req.body;
  if (contentBlock.type === 'question') {
    return validateRequest(createQuestionVersionSchema)(req, res, next);
  }
  return res.status(400).json({ error: 'Unknown content block type.' });
}

export function validateVersionPublicationRequest() {
  return validateRequest(versionPublishSchema);
}

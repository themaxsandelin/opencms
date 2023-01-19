import { NextFunction } from 'express';

export const RequestLogger = (logger) => (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
};

export const ErrorLogger = (logger) => (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`${req.method} failed for ${req.originalUrl}`, err.stack);
};

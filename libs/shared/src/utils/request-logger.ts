// Dependencies
import { Logger } from 'pino';
import { Request, Response, NextFunction } from 'express';

export function RequestLogger(logger: Logger) {
  return (req: Request, res: Response, next: NextFunction) => {
    logger.info(`${req.method} ${req.originalUrl}`);
    next();
  }
}

export function ErrorLogger(logger: Logger) {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(`${req.method} failed for ${req.originalUrl}`, err.stack);
    next();
  }
}

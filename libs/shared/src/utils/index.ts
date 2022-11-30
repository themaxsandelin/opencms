// Dependencies
import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function validateRequest(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params
      });

      const { locale, environment, site: siteKey } = req.query;

      if (locale) {
        const selectedLocale = await prisma.locale.findFirst({
          where: {
            code: (locale as string),
          }
        })
        if (!selectedLocale) {
          return res.status(400).json({ error: `The provided locale code ${locale} is not valid.` });
        }
        req.body.selectedLocale = selectedLocale;
      }

      if (environment) {
        const publishingEnvironment = await prisma.publishingEnvironment.findFirst({
          where: {
            key: (environment as string)
          }
        });
        if (!publishingEnvironment) {
          return res.status(400).json({ error: 'Invalid or unknown environment key.' });
        }
        req.body.publishingEnvironment = publishingEnvironment;
      }

      if (siteKey) {
        const site = await prisma.site.findFirst({
          where: {
            key: (siteKey as string)
          }
        });
        if (!site) {
          return res.status(400).json({ error: `Could not find a site with the key ${siteKey}` });
        }
        req.body.site = site;
      }

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.issues[0].message });
      }
      return res.status(500).json({ error: (error as any).message });
    }
  }
}

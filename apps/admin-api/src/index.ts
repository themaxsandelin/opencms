// Dependencies
import express, { Express } from 'express';

// Main router
import router from './routes';

// Shared
import { RequestLogger, ErrorLogger } from '@open-cms/shared/utils/request-logger';

// Utils
import logger from './utils/logger';
import { authorizeUserByToken } from './utils/auth';
import { validateEnvVars } from './utils/env';

// Workaround NX overwriting env variables at build time.
const env = {...process}.env;
validateEnvVars(env);

const port = env.PORT || 3100;

const app: Express = express();

app.use(express.json());
app.use(async (req, res, next) => {
  if (!req.headers.authorization) {
    logger.error('No authorization header found.', req.headers);
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  const [, token] = req.headers.authorization.split(' ');
  const { valid, reason, user, error } = await authorizeUserByToken(token);
  if (!valid) {
    if (error) {
      logger.error(error);
    }

    let reasonText = 'Unauthorized.';
    if (reason === 'token-expired') {
      reasonText = 'Token expired.';
    }
    return res.status(401).json({ error: reasonText });
  }
  req.body.user = user;
  next();
});

app.use(RequestLogger(logger));
app.use(router);
app.use(ErrorLogger(logger));

app.listen(port, () => {
  logger.info(`[🤖 Admin API Server]: Up and running on port ${port}`);
});

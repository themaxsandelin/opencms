// Dependencies
import express, { Express } from 'express';
import dotenv from 'dotenv';

// Main router
import router from './routes';

// Utils
import { authorizeUserByToken } from './utils/auth';
import { validateEnvVars } from './utils/env';

// Load in environment variables
const { parsed } = dotenv.config();
const env = { ...process.env, ...parsed };
validateEnvVars(env);

const port = 3000//env.PORT || 3100;

const app: Express = express();
app.use(express.json());
app.use(async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  const [, token] = req.headers.authorization.split(' ');
  const { valid, reason, user } = await authorizeUserByToken(token);
  if (!valid) {
    let error = 'Unauthorized.';
    if (reason === 'token-expired') {
      error = 'Token expired.';
    }
    return res.status(401).json({ error });
  }
  req.body.user = user;
  next();
});

app.use(router);

app.listen(port, () => {
  console.log('[🤖 Admin API Server]: Up and running!');
});

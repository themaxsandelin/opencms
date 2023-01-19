// Dependencies
import express, { Express } from 'express';

// Main router
import router from './routes';

// Utils
import logger from './utils/logger';
import { RequestLogger, ErrorLogger } from '@open-cms/shared/utils/requestlogger';

// Workaround NX overwriting env variables at build time.
const env = { ...process }.env;

const app: Express = express();
app.use(express.json());
const port = env.PORT || 3200;

app.use(RequestLogger(logger));
app.use(router);
app.use(ErrorLogger(logger));

app.listen(port, () => {
  logger.info(`[🤖 Content API Server]: Up and running on port ${port}`);
});

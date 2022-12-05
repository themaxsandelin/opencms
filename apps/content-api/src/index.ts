// Dependencies
import express, { Express } from 'express';

// Main router
import router from './routes';

// Workaround NX overwriting env variables at build time.
const env = {...process}.env;

const app: Express = express();
app.use(express.json());
const port = env.PORT || 3200;

app.use(router);

app.listen(port, () => {
  console.log('[🤖 Content API Server]: Up and running!');
});

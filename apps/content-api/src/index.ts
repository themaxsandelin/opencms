// Dependencies
import express, { Express } from 'express';

// Main router
import router from './routes';

const app: Express = express();
app.use(express.json());
const port = process.env.NX_PORT || 3200;

app.use(router);

app.listen(port, () => {
  console.log('[🤖 Content API Server]: Up and running!');
});

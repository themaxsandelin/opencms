// Dependencies
import express, { Express } from 'express';
import dotenv from 'dotenv';

// Main router
import router from './routes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3100;

app.use(router);

app.listen(port, () => {
  console.log('[🤖 Server]: Up and running!');
});
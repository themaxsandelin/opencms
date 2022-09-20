// Dependencies
import express, { Express } from 'express';
import dotenv from 'dotenv';

// Main router
import router from './routes';

dotenv.config();

const app: Express = express();
app.use(express.json());
const port = process.env.PORT || 3200;

app.use(router);

app.listen(port, () => {
  console.log('[🤖 Content API Server]: Up and running!');
});

import dotenv from 'dotenv';
import { dotenvConfig } from '@config/dotenv';

dotenv.config(dotenvConfig);

import 'express-async-errors';
import cors from 'cors';
import express, { Express } from 'express';
import { requestLogger, appErrorHandler, notFoundHandler } from '@middleware';
import { routes } from '@modules';
import { getIPv4Address } from '@utils/ip';
import { staticFiles } from '@static';
import '@utils/process';
// import { hlsInit } from '@config/hls';

const app: Express = express();
const port = process.env.NODE_APP_PORT || 5708;

app.use(cors());
app.use(requestLogger);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

Object.keys(routes).forEach((key) => {
  app.use(key, routes[key]);
});

// hlsInit(app);

app.use(staticFiles);
app.use(notFoundHandler);
app.use(appErrorHandler);

app.listen(port, () => {
  console.log(`   ⚡️ BE Server is ready`);
  getIPv4Address().forEach((address) => {
    console.log(`   ➜  ${address.type}: http://${address.address}:${port}/`);
  });
});

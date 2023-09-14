import dotenv from 'dotenv';
import { dotenvConfig } from '@config/dotenv';

dotenv.config(dotenvConfig);

import 'express-async-errors';
import cors from 'cors';
import express, { Express } from 'express';
import { requestLogger, appErrorHandler, notFoundHandler } from '@middleware';
import { routes } from '@modules';
import { getIPv4Address } from '@utils/ip';
import { hlsFiles, webFiles } from '@static';
import { appInit } from '@config/app';
import '@utils/process';

const app: Express = express();
const port = process.env.NODE_APP_PORT || 80;

appInit();
app.use(cors());
app.use(requestLogger);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

Object.keys(routes).forEach((key) => {
  app.use(key, routes[key]);
});

app.use('/stream-static', hlsFiles);

app.use(webFiles);
app.use(notFoundHandler);
app.use(appErrorHandler);

app.listen(port, () => {
  console.log(
    ['A:', 'B:', 'C:', 'D:', 'E:', 'F:', 'G:', 'H:', 'I:', 'J:', 'K:', 'L:', 'M:'].slice(0, 0),
    ['N:', 'O:', 'P:', 'Q:', 'R:', 'S:', 'T:', 'U:', 'V:', 'W:', 'X:', 'W:', 'Z:'].slice(0, 0),
    `⚡️ BE Server is ready`,
  );
  getIPv4Address().forEach((address) => {
    console.log(`   ➜  ${address.type}: http://${address.address}:${port}/`);
  });
});

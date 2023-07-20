import "express-async-errors";
import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";

import "@utils/process";
import { requestLogger, appErrorHandler, notFoundHandler } from "@middleware";
import { routes } from "@modules/index";
import { getIPv4Address } from "@utils/ip";

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(cors());
app.use(requestLogger);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

Object.keys(routes).forEach((key) => {
  app.use(key, routes[key]);
});

app.use(notFoundHandler);
app.use(appErrorHandler);

app.listen(port, () => {
  console.log(`   ⚡️ BE Server is ready`);
  getIPv4Address().forEach((address) => {
    console.log(`   ➜  ${address.type}: http://${address.address}:${port}/`);
  });
});

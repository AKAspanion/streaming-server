import "express-async-errors";
import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { requestLogger, appErrorHandler, notFoundHandler } from "@middleware";
import { routes } from "@modules";
import { getIPv4Address } from "@utils/ip";
import { dotenvConfig } from "@config/dotenv";
import "@utils/process";

dotenv.config(dotenvConfig);

const app: Express = express();
const port = process.env.NODE_APP_PORT || 5708;

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

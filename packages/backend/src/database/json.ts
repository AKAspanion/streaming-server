import { JsonDB, Config } from "node-json-db";
import path from "path";

export const vidoesDB = new JsonDB(
  new Config(
    path.resolve(__dirname, "../../_db/StreamingServerVideoDB"),
    true,
    false,
    "/"
  )
);

export const subsDB = new JsonDB(
  new Config(
    path.resolve(__dirname, "../../_db/StreamingServerSubsDB"),
    true,
    false,
    "/"
  )
);

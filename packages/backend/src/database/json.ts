import { JsonDB, Config } from "node-json-db";

export const vidoesDB = new JsonDB(
  new Config("_db/StreamingServerVideoDB", true, false, "/")
);

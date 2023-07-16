import { JsonDB, Config } from "node-json-db";

export const vidoesDB = new JsonDB(
  new Config("_db/StreamingServerDB", true, false, "/")
);

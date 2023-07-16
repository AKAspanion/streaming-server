import mysql from "mysql";

export const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Ankit@12",
  database: "ExpressIntegration",
});

import { isEnvProduction } from "@/lib/env/isEnvProduction";
import { ConnectionOptions } from "mysql2";
import { IMySQLConnection } from "./IMySQLDatabase";

export class MISDatabase implements IMySQLConnection {
  private credentials: ConnectionOptions = {
    host: process.env.NEXT_DBHOST,
    user: process.env.NEXT_DBUSER,
    password: process.env.NEXT_DBPASS,
    database: isEnvProduction
      ? process.env.NEXT_DBNAME
      : process.env.NEXT_DEV_DBNAME,
  };

  getConnection = () => {
    return this.credentials;
  };
}

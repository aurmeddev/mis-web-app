import { isEnvProduction } from "@/lib/env/isEnvProduction";
import { ConnectionOptions } from "mysql2";
import { IMySQLConnection } from "./IMySQLDatabase";

export class CMSV2Database implements IMySQLConnection {
  private credentials: ConnectionOptions = {
    host: process.env.NEXT_DBHOST,
    user: process.env.NEXT_DBUSER,
    password: process.env.NEXT_DBPASS,
    database: isEnvProduction
      ? process.env.NEXT_CMSV2_DBNAME
      : process.env.NEXT_CMSV2_DEV_DBNAME,
  };

  getConnection = () => {
    return this.credentials;
  };
}

// Example usage:
// const conn = new MySQLDatabase(new CMSV2Database().getConnection());
// await conn.query({
//   query: "SELECT 1",
//   values: [],
// });

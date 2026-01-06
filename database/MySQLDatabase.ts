import mysql, { ConnectionOptions } from "mysql2/promise";
import { IMySQLDatabase, IQuery } from "./IMySQLDatabase";
export class MySQLDatabase implements IMySQLDatabase {
  constructor(private credentials: ConnectionOptions) {}
  query = async (params: IQuery) => {
    const { query, values } = params;
    const db = await mysql.createConnection(this.credentials);
    try {
      const [results] = await db.execute(query, values);
      return results;
    } catch (error: any) {
      throw new Error(error.message);
    } finally {
      await db.end(); // <-- Always closes the connection even if error happens
    }
  };
}

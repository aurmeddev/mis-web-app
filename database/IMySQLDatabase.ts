import { ConnectionOptions } from "mysql2/promise";

interface IQuery {
  query: string;
  values: any[];
}

interface IMySQLDatabase {
  query: (params: IQuery) => Promise<any>;
}

interface IMySQLConnection {
  getConnection: () => ConnectionOptions;
}

export type { IQuery, IMySQLDatabase, IMySQLConnection };

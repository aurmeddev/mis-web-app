interface IQuery {
  query: string;
  values: any[];
}

interface IMySQLDatabase {
  query: (params: IQuery) => Promise<any>;
}

export type { IQuery, IMySQLDatabase };

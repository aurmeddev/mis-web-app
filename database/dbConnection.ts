import { isEnvProduction } from "@/lib/env/isEnvProduction";
import mysql, { ConnectionOptions } from "mysql2/promise";

export async function query({
  query,
  values,
}: {
  query: any;
  values: string[];
}) {
  const access: ConnectionOptions = {
    host: process.env.NEXT_PUBLIC_DBHOST,
    user: process.env.NEXT_PUBLIC_DBUSER,
    password: process.env.NEXT_PUBLIC_DBPASS,
    database: isEnvProduction
      ? process.env.NEXT_PUBLIC_DBNAME
      : process.env.NEXT_PUBLIC_DEV_DBNAME,
  };

  const db = await mysql.createConnection(access);
  try {
    const [results] = await db.execute(query, values);
    return results;
  } catch (error: any) {
    throw new Error(error.message);
  } finally {
    await db.end(); // <-- Always closes the connection even if error happens
  }
}

export type ApiResponseProps = {
  isSuccess: boolean;
  data: any[];
  message: string;
};

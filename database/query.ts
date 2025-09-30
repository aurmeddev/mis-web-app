// import { pool } from "./pool";

// export async function query({
//   query,
//   values,
// }: {
//   query: string;
//   values: string[];
// }) {
//   let connection;
//   try {
//     connection = await pool.getConnection();
//     const [rows] = await connection.execute(query, values);
//     return rows;
//   } catch (error) {
//     console.error("Database query failed:", error);
//     throw error;
//   } finally {
//     // Release the Connection Back to the Pool
//     // THIS IS CRUCIAL! The connection is NOT closed, but returned to the pool for reuse.
//     if (connection) {
//       console.log("Releasing connection back to the pool");
//       connection.release();
//     }
//   }
// }

// export type ApiResponseProps = {
//   isSuccess: boolean;
//   data: any[];
//   message: string;
// };

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
    host: process.env.NEXT_DBHOST,
    user: process.env.NEXT_DBUSER,
    password: process.env.NEXT_DBPASS,
    database: isEnvProduction
      ? process.env.NEXT_DBNAME
      : process.env.NEXT_DEV_DBNAME,
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

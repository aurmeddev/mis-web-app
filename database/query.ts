import { pool } from "./pool";

export async function query({
  query,
  values,
}: {
  query: string;
  values: string[];
}) {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute(query, values);
    return rows;
  } catch (error) {
    console.error("Database query failed:", error);
    throw error;
  } finally {
    // Release the Connection Back to the Pool
    // THIS IS CRUCIAL! The connection is NOT closed, but returned to the pool for reuse.
    if (connection) {
      console.log("Releasing connection back to the pool");
      connection.release();
    }
  }
}

export type ApiResponseProps = {
  isSuccess: boolean;
  data: any[];
  message: string;
};

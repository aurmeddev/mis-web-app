import { isEnvProduction } from "@/lib/env/isEnvProduction";
import mysql, { Pool, PoolOptions } from "mysql2/promise";

const poolConfig: PoolOptions = {
  host: process.env.NEXT_MIS_DBHOST,
  password: process.env.NEXT_MIS_DBPASS,
  user: process.env.NEXT_DBUSER,
  database: isEnvProduction
    ? process.env.NEXT_DBNAME
    : process.env.NEXT_DEV_DBNAME,
  waitForConnections: true,
  connectionLimit: 20, // Use a much smaller, safer limit (e.g., 10-20)
  maxIdle: 20, // Same as connectionLimit
  idleTimeout: isEnvProduction ? 25200000 : 60000, // 7 hours (Slightly less than MySQL's default of 8 hours)
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

// Ensure a single pool in dev / warm serverless
declare global {
  var MYSQL_POOL: Pool | undefined;
}

// Initialize the Connection Pool ONCE and export it.
export const pool: Pool = global.MYSQL_POOL ?? mysql.createPool(poolConfig);
if (!global.MYSQL_POOL) global.MYSQL_POOL = pool;
console.log("Database Pool initialized");

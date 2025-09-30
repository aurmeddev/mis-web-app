import { isEnvProduction } from "@/lib/env/isEnvProduction";
import mysql, { ConnectionOptions } from "mysql2/promise";

const poolConfig: ConnectionOptions = {
  host: process.env.NEXT_DBHOST,
  user: process.env.NEXT_DBUSER,
  password: process.env.NEXT_DBPASS,
  database: isEnvProduction
    ? process.env.NEXT_DBNAME
    : process.env.NEXT_DEV_DBNAME,
  waitForConnections: true,
  connectionLimit: 50, // Use a much smaller, safer limit (e.g., 10-20)
  maxIdle: 50, // Same as connectionLimit
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

// Initialize the Connection Pool ONCE and export it.
export const pool = mysql.createPool(poolConfig);

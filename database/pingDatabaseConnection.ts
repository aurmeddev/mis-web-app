import { poolQuery } from "./poolQuery";
// Function to ping the database pool to keep connections alive and prevent timeouts
export const pingDatabaseConnection = async () => {
  console.log("Starting database pool pinger...");
  try {
    await poolQuery({
      query: "SELECT 1",
      values: [],
    });
    return {
      isSuccess: true,
      message: "Database connection is alive.",
    };
  } catch (error) {
    console.error("Connection PING failed. Pool may be having issues:", error);
    return {
      isSuccess: false,
      message: "Database connection ping failed.",
    };
  }
};

import { pingDatabaseConnection } from "@/database/pingDatabaseConnection";
import { NextResponse } from "next/server";
export const GET = async () => {
  // Run a SELECT 1 query every 3 minutes ("*/3 * * * *") to keep the tcp alive.
  const { isSuccess, message } = await pingDatabaseConnection();
  return NextResponse.json(
    {
      isSuccess,
      message: message,
    },
    { status: isSuccess ? 200 : 500 }
  );
};

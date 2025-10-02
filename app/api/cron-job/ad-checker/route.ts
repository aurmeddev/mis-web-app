import { NextResponse } from "next/server";
export const GET = async () => {
  // Run ad checker every 2 hours or ("0 */2 * * *")
  const message = "Ad Checker Cron Job executed successfully";
  console.log(message);
  return NextResponse.json(
    {
      isSuccess: true,
      message: message,
    },
    { status: 200 }
  );
};

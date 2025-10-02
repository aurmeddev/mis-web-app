import { executePoolPinger } from "@/database/ping";
import { NextResponse } from "next/server";
export const GET = async () => {
  const { isSuccess, message } = await executePoolPinger();
  return NextResponse.json(
    {
      isSuccess,
      message,
    },
    { status: isSuccess ? 200 : 500 }
  );
};

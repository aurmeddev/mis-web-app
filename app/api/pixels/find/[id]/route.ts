import { IPixelFindServer } from "@/lib/features/pixel/IPixel";
import { PixelServer } from "@/lib/features/pixel/PixelServer";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";

import { NextResponse, NextRequest } from "next/server";
export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  // Check if the user session is valid before processing the request
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Session expired or invalid",
      },
      { status: 403 }
    );
  }

  const searchKeyword = `${(await params).id}`;
  let payload: IPixelFindServer;
  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Invalid JSON payload.",
        data: [],
      },
      { status: 400 }
    );
  }

  const pixel = new PixelServer();
  const { isSuccess, data, message } = await pixel.find({
    searchKeyword,
    payload,
    requestUrlSearchParams: request.nextUrl.searchParams,
  });

  return NextResponse.json(
    {
      isSuccess,
      message,
      data: data,
    },
    { status: isSuccess ? 200 : 400 }
  );
};

import { IPixelPost } from "@/lib/features/pixel/IPixel";
import { FacebookPixelDebuggerServerApi } from "@/lib/features/postback/debugger/facebook/FacebookPixelDebuggerServerApi";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { NextRequest, NextResponse } from "next/server";
export const POST = async (request: NextRequest) => {
  // Check if the user session is valid before processing the request
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Session expired or invalid",
      },
      { status: 403 },
    );
  }

  let requestBody: Omit<IPixelPost, "traffic_source_id">;
  try {
    requestBody = await request.json();
  } catch (error) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Invalid JSON payload.",
        data: [],
      },
      { status: 400 },
    );
  }

  if (!requestBody.pixel) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Pixel is required.",
        data: [],
      },
      { status: 400 },
    );
  }

  if (!requestBody.token) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Token is required.",
        data: [],
      },
      { status: 400 },
    );
  }

  // Proceed to debug the pixel
  const api = new FacebookPixelDebuggerServerApi();
  const { isSuccess, message } = await api.debug(requestBody);
  return NextResponse.json(
    {
      isSuccess,
      message,
    },
    { status: isSuccess ? 201 : 500 },
  );
};

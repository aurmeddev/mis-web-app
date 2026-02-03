import { FacebookPixelDebuggerServerApi } from "@/lib/features/pixel/debugger/facebook/FacebookPixelDebuggerServerApi";
import { IPixelPost } from "@/lib/features/pixel/IPixel";
import { PixelServer } from "@/lib/features/pixel/PixelServer";
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

  let requestBody: IPixelPost;
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

  // Validate if the pixel already exists
  const pixel = new PixelServer();
  const customSearchParams = new URLSearchParams();
  customSearchParams.set("method", "find-one");
  customSearchParams.set("condition", "all");
  const validationResponse = await pixel.find({
    searchKeyword: "validation",
    requestUrlSearchParams: customSearchParams,
    payload: { pixel: requestBody.pixel },
  });

  if (!validationResponse.isSuccess) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Validation error occurred.",
        data: [],
      },
      { status: 400 },
    );
  }

  const doesPixelExist = validationResponse.data.length > 0;
  if (doesPixelExist) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "The pixel you provided already exists. Please try again.",
        data: [],
      },
      { status: 409 },
    );
  }

  // Validate the pixel
  const api = new FacebookPixelDebuggerServerApi();
  const debuggingResult = await api.debug({
    pixel: requestBody.pixel,
    token: requestBody.token,
  });

  if (!debuggingResult.isSuccess) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: JSON.stringify(debuggingResult.message),
        data: [],
      },
      { status: 400 },
    );
  }

  // Proceed to create the pixel
  const { isSuccess, data, message } = await pixel.post(requestBody);
  return NextResponse.json(
    { isSuccess, data, message },
    { status: isSuccess ? 201 : 500 },
  );
};

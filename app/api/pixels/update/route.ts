import { FacebookPixelDebuggerServerApi } from "@/lib/features/pixel/debugger/facebook/FacebookPixelDebuggerServerApi";
import { IPixelUpdate } from "@/lib/features/pixel/IPixel";
import { PixelServer } from "@/lib/features/pixel/PixelServer";
import { ServerPostbackLogs } from "@/lib/features/postback/logs/export/ServerPostbackLogs";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { NextRequest, NextResponse } from "next/server";
export const PUT = async (request: NextRequest) => {
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

  let requestBody: IPixelUpdate;
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

  const { id, pixel, token } = requestBody;

  if (!id) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "ID is required.",
        data: [],
      },
      { status: 400 },
    );
  }

  if (typeof id !== "number") {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "ID is invalid.",
        data: [],
      },
      { status: 400 },
    );
  }

  if (!pixel) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Pixel is required.",
        data: [],
      },
      { status: 400 },
    );
  }

  if (!token) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Token is required.",
        data: [],
      },
      { status: 400 },
    );
  }

  // Validate the pixel and access token for conversion API
  const api = new FacebookPixelDebuggerServerApi();
  const debuggingResult = await api.debug({
    pixel,
    token,
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

  // Update postback log status to 'not fixed' for this pixel
  const logs = new ServerPostbackLogs();
  const searchPixelResult = await logs.findByPixel({
    pixel,
  });

  if (!searchPixelResult.isSuccess) {
    console.error(
      `Failed to search postback logs for pixel ${pixel}: ${searchPixelResult.message}`,
    );
    return NextResponse.json(
      {
        isSuccess: searchPixelResult.isSuccess,
        data: searchPixelResult.data,
        message: searchPixelResult.message,
      },
      { status: 500 },
    );
  }

  if (searchPixelResult.data.length > 0) {
    const { isSuccess, data, message } = await logs.updatePostbackLogStatus({
      pixel,
    });

    if (!isSuccess) {
      console.error(
        `Failed to update postback log status for pixel ${pixel}: ${message}`,
      );
      return NextResponse.json({ isSuccess, data, message }, { status: 500 });
    }
  }

  const pixelServer = new PixelServer();
  const { isSuccess, data, message } = await pixelServer.update({
    id,
    // pixel, Exclude pixel from update to prevent changing pixel value
    token,
  });
  return NextResponse.json(
    { isSuccess, data, message },
    { status: isSuccess ? 201 : 500 },
  );
};

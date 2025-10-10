import { FacebookAdsManagerServerService } from "@/lib/features/ads-manager/facebook/FacebookAdsManagerServerService";
import { UpdateDeliveryStatusProps } from "@/lib/features/ads-manager/facebook/type/FacebookMarketingApiProps";
import { CryptoServerService } from "@/lib/features/security/cryptography/CryptoServerService";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { NextResponse, NextRequest } from "next/server";
export const POST = async (request: NextRequest) => {
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

  let payload: UpdateDeliveryStatusProps & {
    access_token: string;
  } = {
    id: "",
    status: "PAUSED",
    access_token: "",
    // app_secret_key: undefined;
  };

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

  if (!payload.access_token) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Marketing API access token is missing.",
        data: [],
      },
      { status: 400 }
    );
  }

  if (!payload.id) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Campaign ID or Adset ID is missing.",
        data: [],
      },
      { status: 400 }
    );
  }

  if (!payload.status) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Status value is missing. It must be either ACTIVE or PAUSED.",
        data: [],
      },
      { status: 400 }
    );
  }

  const decipher = new CryptoServerService();
  const decryptedData = await decipher.decrypt({
    data: payload.access_token,
  });

  if (!decryptedData.isSuccess) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: decryptedData.message,
        data: [],
      },
      { status: 400 }
    );
  }

  const graphApi = new FacebookAdsManagerServerService({
    access_token: decryptedData.decryptedData,
  });

  // Activate or Pause the campaign
  const { isSuccess, message } = await graphApi.updateDeliveryStatus({
    id: payload.id,
    status: payload.status,
  });

  if (!isSuccess) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: message,
        data: [],
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      isSuccess: true,
      message: message,
      data: [],
    },
    { status: 201 }
  );
};

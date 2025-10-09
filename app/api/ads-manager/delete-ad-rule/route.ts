import { FacebookAdsManagerServerService } from "@/lib/features/ads-manager/facebook/FacebookAdsManagerServerService";
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

  let payload: {
    access_token: string;
    ad_account_id: string;
    // app_secret_key?: string;
  } = {
    access_token: "",
    ad_account_id: "",
    // app_secret_key:"",
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

  if (!payload.ad_account_id) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Ad account id is missing.",
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

  const { delete_ad_rules_status } = await graphApi.processDeleteAdRules({
    id: payload.ad_account_id,
  });

  return NextResponse.json(
    {
      isSuccess: true,
      message: "Success",
      data: [{ delete_ad_rules_status }],
    },
    { status: 201 }
  );
};

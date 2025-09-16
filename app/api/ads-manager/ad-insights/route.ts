import {
  FacebookAdsManagerServerService,
  formatCampaigns,
} from "@/lib/features/ads-manager/FacebookAdsManagerServerService";
import { CryptoServerService } from "@/lib/features/security/cryptography/CryptoServerService";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
import { addDays, format } from "date-fns";
import { NextResponse, NextRequest } from "next/server";
export const POST = async (request: NextRequest) => {
  // Check if the user session is valid before processing the request
  // const session = await getSession();
  // if (!session) {
  //   return NextResponse.json(
  //     {
  //       isSuccess: false,
  //       message: "Session expired or invalid",
  //     },
  //     { status: 403 }
  //   );
  // }

  const {
    date_from,
    date_to,
  }: // app_secret_key, NOTE: Develop an additional layer of security by requiring app secret
  {
    date_from?: string;
    date_to?: string;
    // app_secret_key?: string;
  } = new SearchParamsManager().toObject(request.nextUrl.searchParams);

  let payload: {
    access_token: string;
  } = { access_token: "" };
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

  const yesterday = {
    from: date_from || format(addDays(new Date(), -1), "yyyy-MM-dd"),
    to: date_to || format(addDays(new Date(), -1), "yyyy-MM-dd"),
  };

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
  const { isSuccess, data, message } = await graphApi.getAdAccounts({});
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

  const AdAccounts = [...data];
  for (const ada of AdAccounts) {
    const { data } = await graphApi.adInsights({
      id: ada.id,
      time_ranges: `[{"since":"${yesterday.from}","until":"${yesterday.to}"}]`,
    });
    ada.campaigns = data;
  }

  return NextResponse.json(
    {
      isSuccess: true,
      message: "Success",
      data: formatCampaigns(AdAccounts),
    },
    { status: 200 }
  );
};

import {
  FacebookAdsManagerServerService,
  formatCampaigns,
} from "@/lib/features/ads-manager/facebook/FacebookAdsManagerServerService";
import { VoluumApiServerService } from "@/lib/features/ads-manager/voluum/VoluumApiServerService";
import { CryptoServerService } from "@/lib/features/security/cryptography/CryptoServerService";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { addDays, format } from "date-fns";
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
    date_from?: string;
    date_to?: string;
    filtering: { field: string; operator: "CONTAIN"; value: string }[];
    isVoluumIncluded: boolean;
    // app_secret_key?: string;
  } = {
    isVoluumIncluded: true,
    access_token: "",
    filtering: [],
    date_from: undefined,
    date_to: undefined, // app_secret_key: undefined;
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

  const yesterday = {
    from: payload.date_from || format(addDays(new Date(), -1), "yyyy-MM-dd"),
    to: payload.date_to || format(addDays(new Date(), -1), "yyyy-MM-dd"),
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
  const { isSuccess, data, message } = await graphApi.getAdAccounts();
  if (!isSuccess) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: message,
        data: graphApi.getFallbackResponseData({
          code: 500,
          status: "Facebook server error",
          adSummaryLabel: "ad_insights_summary",
          props: { ...graphApi.formatInsightsFields([]) },
        }),
      },
      { status: 500 }
    );
  }

  const AdAccounts = [...data];
  // await Promise.allSettled(
  //   AdAccounts.map(async (ada) => {
  //     const { data } = await graphApi.adInsights({
  //       id: ada.id,
  //       time_ranges: `[{"since":"${yesterday.from}","until":"${yesterday.to}"}]`,
  //       filtering: payload.filtering || [],
  //     });
  //     ada.campaigns = data;
  //   })
  // );
  for (const ada of AdAccounts) {
    const { data } = await graphApi.adInsights({
      id: ada.id,
      time_ranges: `[{"since":"${yesterday.from}","until":"${yesterday.to}"}]`,
      filtering: payload.filtering || [],
    });
    ada.campaigns = data;
  }

  const formattedCampaigns = formatCampaigns(AdAccounts);
  if (!payload.isVoluumIncluded) {
    return NextResponse.json(
      {
        isSuccess: true,
        message: "Success",
        data: formattedCampaigns,
      },
      { status: 200 }
    );
  }

  const voluumApi = new VoluumApiServerService();
  const withVoluumAdInsights = formattedCampaigns.slice(); // Create a new array using slice method.
  // await Promise.allSettled(
  //   withVoluumAdInsights.map(async (campaign) => {
  //     const { data } = await voluumApi.adInsights({
  //       spend: campaign?.spend || 0,
  //       adset_name: campaign?.name,
  //       date_from: yesterday.from,
  //       date_to: yesterday.to,
  //     });
  //     for (const key of Object.keys({ ...data[0] })) {
  //       const value = data[0][key];
  //       campaign[key] = value;
  //     }
  //   })
  // );

  const authVoluum = await voluumApi.getSessionToken();
  if (!authVoluum.isSuccess) {
    console.error("Voluum session error", authVoluum.message);
    return NextResponse.json(
      {
        isSuccess: true,
        message: "Success",
        data: formattedCampaigns,
      },
      { status: 200 }
    );
  }

  const sessionToken: string = authVoluum.data[0].token || "";
  for (const campaign of withVoluumAdInsights) {
    const spend: number = campaign?.spend || 0;
    const campaignName: string = campaign?.name || "";
    const { data } = await voluumApi.adInsights({
      spend: spend,
      adset_name: campaignName,
      date_from: yesterday.from,
      date_to: yesterday.to,
      sessionToken: sessionToken,
    });
    for (const key of Object.keys({ ...data[0] })) {
      const value = data[0][key];
      campaign[key] = value;
    }
  }

  return NextResponse.json(
    {
      isSuccess: true,
      message: "Success",
      data: withVoluumAdInsights,
    },
    { status: 200 }
  );
};

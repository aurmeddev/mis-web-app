import {
  FacebookAdsManagerServerService,
  formatCampaigns,
} from "@/lib/features/ads-manager/facebook/FacebookAdsManagerServerService";
import { CryptoServerService } from "@/lib/features/security/cryptography/CryptoServerService";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { DatetimeUtils } from "@/lib/utils/date/DatetimeUtils";
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
    // app_secret_key?: string;
  } = {
    access_token: "",
    date_from: "",
    date_to: "",
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

  const dateUtils = new DatetimeUtils();
  const currentDateInTimezone = dateUtils.getDatesInTimezone();
  const yesterdayAndToday = {
    from:
      payload.date_from ||
      format(addDays(currentDateInTimezone, -1), "yyyy-MM-dd"),
    to:
      payload.date_to ||
      format(addDays(currentDateInTimezone, 0), "yyyy-MM-dd"),
  };
  console.log("yesterdayAndToday", yesterdayAndToday);

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
    const data = graphApi.getFallbackResponseData({
      code: 500,
      status: "Facebook server error",
      adSummaryLabel: "ad_checker_summary",
    });
    return NextResponse.json(
      {
        isSuccess: false,
        message: message,
        data: data[0].adsets,
      },
      { status: 500 }
    );
  }

  const AdAccounts = [...data];
  for (const ada of AdAccounts) {
    const accountId = ada.id;
    const accountStatus = ada.account_status;
    const { delete_ad_rules_status } = await graphApi.processDeleteAdRules({
      id: accountId,
    });
    ada.delete_ad_rules_status = delete_ad_rules_status;
    const { data } = await graphApi.adChecker({
      id: accountId,
      time_ranges: `[{"since":"${yesterdayAndToday.from}","until":"${yesterdayAndToday.to}"}]`,
      account_status: accountStatus,
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

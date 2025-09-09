import { FacebookAdsManagerServerService } from "@/lib/features/ads-manager/FacebookAdsManagerServerService";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
import { addDays, format } from "date-fns";
import { NextResponse, NextRequest } from "next/server";
export const GET = async (request: NextRequest) => {
  const {
    access_token,
    date_from,
    date_to,
  }: {
    access_token: string;
    date_from?: string;
    date_to?: string;
  } = new SearchParamsManager().toObject(request.nextUrl.searchParams);

  const yesterdayAndToday = {
    from: date_from || format(addDays(new Date(), -1), "yyyy-MM-dd"),
    to: date_to || format(addDays(new Date(), 0), "yyyy-MM-dd"),
  };
  console.log(yesterdayAndToday);
  const graphApi = new FacebookAdsManagerServerService({
    access_token: access_token,
  });
  const adAccountResult = await graphApi.getAdAccounts({});
  const AdAccounts = [...adAccountResult.data];
  for (const ada of AdAccounts) {
    const { data } = await graphApi.getAdCreatives({
      id: ada.id,
      time_ranges: `[{"since":"${yesterdayAndToday.from}","until":"${yesterdayAndToday.to}"}]`,
    });
    ada.campaigns = data;
  }

  if (!adAccountResult.isSuccess) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: adAccountResult.message,
        data: [],
      },
      { status: 500 }
    );
  }
  return NextResponse.json(
    {
      isSuccess: true,
      message: "Success",
      data: AdAccounts,
    },
    { status: 200 }
  );
};

// const getInsights = async (params: {
//   access_token: string;
//   time_ranges: string;
// }) => {
//   const { access_token, time_ranges } = params;
//   const graphApi = new FacebookAdsManagerServerService({
//     access_token: access_token,
//   });
//   const adAccountResult = await graphApi.getAdAccounts({});
//   const AdAccounts = [...adAccountResult.data];
//   for (const ada of AdAccounts) {
//     const { data } = await graphApi.getInsights({
//       id: ada.id,
//       level: "campaign",
//       time_ranges: time_ranges,
//     });
//     for (const adset of data) {
//       const adst = await graphApi.getInsights({
//         id: adset.campaign_id,
//         level: "adset",
//         time_ranges: time_ranges,
//       });
//       adset.adsets = adst.data;
//     }
//     ada.campaigns = data;
//   }

//   return AdAccounts;
// };

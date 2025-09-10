import { FacebookAdsManagerServerService } from "@/lib/features/ads-manager/FacebookAdsManagerServerService";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
import { addDays, format } from "date-fns";
import { NextResponse, NextRequest } from "next/server";
export const GET = async (request: NextRequest) => {
  const {
    access_token,
    date_from,
    date_to,
  }: // app_secret_key, NOTE: Develop an additional layer of security by requiring app secret
  {
    access_token: string;
    date_from?: string;
    date_to?: string;
    // app_secret_key?: string;
  } = new SearchParamsManager().toObject(request.nextUrl.searchParams);

  if (!access_token) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Marketing API access token is missing.",
        data: [],
      },
      { status: 400 }
    );
  }

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
    const { data } = await graphApi.adChecker({
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
  // console.log(formatCampaigns(AdAccounts));
  return NextResponse.json(
    {
      isSuccess: true,
      message: "Success",
      data: formatCampaigns(AdAccounts),
    },
    { status: 200 }
  );
};

function formatCampaigns(data: any) {
  return data.map((item: any) => {
    const { campaigns, ...rest } = item;
    const hasCampaigns = campaigns?.length > 0;
    if (hasCampaigns) {
      const formattedCampaign = campaigns
        .map((campaign: any) => {
          const { adsets } = campaign;
          const hasAdsets = adsets?.length > 0;
          if (hasAdsets) {
            return {
              ...adsets,
            };
          }
        })
        .filter(Boolean); // Exclude null or undefined values
      // Use flatMap to iterate and flatten the nested objects.
      const flattenedCampaigns = formattedCampaign.flatMap((item: any) => {
        return Object.values(item);
      });
      rest.campaigns = flattenedCampaigns;
    } else {
      rest.campaigns = [];
    }
    return { ...rest };
  });
}

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

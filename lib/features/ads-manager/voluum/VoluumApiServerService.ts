import { appBaseUrl } from "@/lib/base-url/appBaseUrl";
import { VoluumApiConfig } from "./config/VoluumApiConfig";

export class VoluumApiServerService {
  private voluumApiConfig = new VoluumApiConfig();
  async getSessionToken() {
    const response = await fetch(`${appBaseUrl}/api/voluum/get-session`, {
      method: "GET",
      headers: {
        "Content-type": "application/json",
      },
      next: { revalidate: 5400 }, // Revalidate every 1.5 hours or 5400 seconds
    });

    const { isSuccess, data, message } = await response.json();
    console.log("Voluum session token:", data);
    return {
      isSuccess,
      data,
      message,
    };
  }

  async adInsights(params: {
    spend: number;
    adset_name: string;
    date_from: string;
    date_to: string;
    sessionToken: string;
  }) {
    const {
      spend,
      adset_name,
      date_from = `${params.date_from}T00:00:00.000Z`,
      date_to = `${plusOneDay(params.date_to)}T00:00:00.000Z`,
      sessionToken,
    } = params;

    if (!isValidAdsetName(adset_name)) {
      const statusMessage = "Invalid adset name";
      return {
        isSuccess: false,
        message: statusMessage,
        data: handleCustomVoluumResponse({ status: statusMessage }),
      };
    }

    const { isSuccess, data, message } = await this.getCampaignRawData({
      filter: adset_name.trim(),
      date_from,
      date_to,
      sessionToken,
    });

    if (!isSuccess || data.length === 0) {
      return { isSuccess, data, message };
    }

    const result = formatAdInsightsResponseData({
      spend: spend,
      data: data,
    });

    return {
      isSuccess: true,
      message: "Data has been fetched successfully!",
      data: result,
    };
  }

  async getCampaignRawData(params: {
    filter: string;
    date_from: string;
    date_to: string;
    sessionToken: string;
  }) {
    const { filter, date_from, date_to, sessionToken } = params;
    console.log("sessionToken: ", sessionToken);
    const response = await fetch(
      `${this.voluumApiConfig.baseUrl}/report?include=ACTIVE&offset=0&tz=Asia/Singapore&column=cv&column=conversions&column=customConversions6&column=customConversions7&column=customConversions11&column=campaignName&groupBy=campaign&sort=campaignName&filter=${filter}&limit=1&from=${date_from}&currency=USD&to=${date_to}&conversionTimeMode=CONVERSION&direction=DESC`,
      {
        method: "GET",
        headers: {
          "CWAUTH-TOKEN": sessionToken,
          "Content-type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Voluum server error", response);
      console.error("Voluum server error", error);
      return {
        isSuccess: false,
        message: error,
        data: handleCustomVoluumResponse({ status: "Voluum server error" }),
      };
    }

    const { rows } = await response.json();
    if (rows.length === 0) {
      return {
        isSuccess: true,
        message: "No data found.",
        data: handleCustomVoluumResponse({ status: "Archived" }),
      };
    }

    return {
      isSuccess: true,
      message: "Data has been fetched successfully!",
      data: rows,
    };
  }
}

/**
 * @param {string} customConversions6 - lead
 * @param {string} customConversions7 - ftd
 * @param {string} customConversions11 - registered
 * @param {string} conversions - leads/registered
 */
type formatAdInsightsResponseDataProps = {
  spend: number;
  data: {
    campaignId: string;
    campaignName: string;
    conversions: number;
    customConversions11: number;
    customConversions6: number;
    customConversions7: number;
    cv: number;
  }[];
};

const formatAdInsightsResponseData = (
  params: formatAdInsightsResponseDataProps
) => {
  const { spend, data } = params;
  const defaultResponse = {
    campaignId: "",
    campaignName: "",
    conversions: 0,
    customConversions11: 0,
    customConversions6: 0,
    customConversions7: 0,
    cv: 0,
  };

  // Providing default values for missing keys.
  const formattedData = { ...defaultResponse } as Record<
    string,
    string | number
  >;
  if (data.length > 0) {
    const firstItem = data[0] as Record<string, string | number>;
    for (const key in formattedData) {
      if (firstItem.hasOwnProperty(key)) {
        const value = firstItem[key];
        formattedData[key] = value;
      }
    }
  }

  // A mapping object to define the new keys.
  const keyMapping = {
    campaignId: "v_campaign_id",
    campaignName: "v_campaign_name",
    conversions: "v_conversions",
    customConversions11: "v_registered",
    customConversions6: "v_lead",
    customConversions7: "v_ftd",
    cv: "v_cv",
  };

  const finalResponse: any = {};
  for (const oldKey in keyMapping) {
    const newKey = keyMapping[oldKey as keyof typeof keyMapping]; // Get the new key name from the mapping object.
    const value = formattedData[oldKey as keyof typeof keyMapping]; // Get the value from the original
    finalResponse[newKey] = value || 0;
  }

  return [finalResponse].map((keys) => {
    const { v_conversions, v_registered, v_lead, v_ftd, ...rest } = keys;
    const lead = v_registered !== 0 ? v_registered : v_lead;
    return {
      ...rest,
      v_lead: lead,
      v_ftd,
      v_cpl: getCostPerEvent({
        spend: spend,
        value: lead,
      }),
      v_cpa: getCostPerEvent({
        spend: spend,
        value: v_ftd,
      }),
      v_campaign_status: "Everything is OK!",
    };
  });
};

/** Commented out to align with the new builder adset name format **/
// const extractVoluumnCampaignId = (adset_name: string) => {
//   if (!adset_name) {
//     return {
//       isSuccess: false,
//       message: "Adset name is missing!",
//       data: [],
//     };
//   }

//   if (adset_name.split("_").length !== 6) {
//     return {
//       isSuccess: false,
//       message: "Adset name is invalid.",
//       data: [],
//     };
//   }

//   return {
//     isSuccess: true,
//     message: "Extracted voluumn ID successfully!",
//     data: [{ id: adset_name.split("_")[5].split(" ")[0] }], // Get only the voluum campaign id
//   };
// };

type handleCustomVoluumResponseProps = {
  status: "Voluum server error" | "Archived" | "Invalid adset name";
};
const handleCustomVoluumResponse = (
  params: handleCustomVoluumResponseProps
) => {
  const defaultResponseError = {
    v_campaign_id: null,
    v_campaign_name: null,
    v_lead: null,
    v_ftd: null,
    v_cv: null,
    v_cpl: null,
    v_cpa: null,
    v_campaign_status: params.status,
  };

  return [defaultResponseError];
};

type getCostPerEventProps = {
  spend: number;
  value: number;
};
export const getCostPerEvent = (params: getCostPerEventProps) => {
  const { spend, value } = params;
  if (typeof spend !== "number" || typeof value !== "number") {
    return 0;
  }

  if (spend === 0 || value === 0) {
    return 0;
  }

  const costPerEvent = spend / value;
  return Number(costPerEvent.toFixed(2));
};

const plusOneDay = (dateString: string) => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
};

const isValidAdsetName = (text: string) => {
  if (!text) {
    return false;
  }
  // Check if the text contains only alphanumeric characters
  return /^[a-zA-Z0-9]+$/.test(text);
};

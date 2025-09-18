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
    return {
      isSuccess,
      data,
      message,
    };
  }

  async adInsights(params: {
    // spend: string | number;
    adset_name: string;
    date_from: string;
    date_to: string;
  }) {
    /**
     * @param {string} customConversions6 - lead
     * @param {string} customConversions7 - ftd
     * @param {string} customConversions11 - registered
     * @param {string} conversions - leads/registered
     */

    const extractResult = extractVoluumnCampaignId(params.adset_name);
    if (!extractResult.isSuccess) {
      return {
        isSuccess: extractResult.isSuccess,
        message: extractResult.message,
        data: handleResponseError("-"),
      };
    }

    const voluumCampaignId = extractResult.data[0].id;
    const date_from = `${params.date_from}T00:00:00.000Z`;
    const date_to = `${plusOneDay(params.date_to)}T00:00:00.000Z`;

    const { isSuccess, data, message } = await this.getSessionToken();
    if (!isSuccess) {
      return {
        isSuccess,
        data: handleResponseError("error"),
        message,
      };
    }

    const response = await fetch(
      `${this.voluumApiConfig.baseUrl}/report?include=ACTIVE&offset=0&tz=Asia/Singapore&column=cv&column=conversions&column=customConversions6&column=customConversions7&column=customConversions11&column=campaignName&groupBy=campaign&sort=campaignName&filter=${voluumCampaignId}&limit=1&from=${date_from}&currency=USD&to=${date_to}&conversionTimeMode=CONVERSION&direction=DESC`,
      {
        method: "GET",
        headers: {
          "CWAUTH-TOKEN": data[0].token,
          "Content-type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error(error);
      return {
        isSuccess: false,
        message: error,
        data: handleResponseError("error"),
      };
    }

    const { rows } = await response.json();
    const result = formatAdInsightsResponseData(rows);
    return {
      isSuccess: false,
      message: "Data has been fetched successfully!",
      data: result,
    };
  }
}

type formatAdInsightsResponseDataProps = {
  campaignName: string;
  conversions: string;
  customConversions11: string;
  customConversions6: string;
  customConversions7: string;
  cv: string;
};

const formatAdInsightsResponseData = (
  response: formatAdInsightsResponseDataProps[]
) => {
  const defaultResponse = {
    campaignName: "0",
    conversions: "0",
    customConversions11: "0",
    customConversions6: "0",
    customConversions7: "0",
    cv: "0",
  };

  // Providing default values for missing keys.
  const formattedData = { ...defaultResponse };
  if (response.length > 0) {
    const firstItem = response[0];
    for (const key in formattedData) {
      if (firstItem.hasOwnProperty(key)) {
        formattedData[key as keyof typeof formattedData] =
          firstItem[key as keyof typeof firstItem] ?? "0";
      }
    }
  }

  // A mapping object to define the new keys.
  const keyMapping = {
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
    finalResponse[newKey] = value ?? "0";
  }

  return [finalResponse];
};

const extractVoluumnCampaignId = (adset_name: string) => {
  if (!adset_name) {
    return {
      isSuccess: false,
      message: "Adset name is missing!",
      data: [],
    };
  }

  if (adset_name.split("_").length !== 6) {
    return {
      isSuccess: false,
      message: "Adset name is invalid.",
      data: [],
    };
  }

  return {
    isSuccess: true,
    message: "Extracted voluumn ID successfully!",
    data: [{ id: adset_name.split("_")[5].split(" ")[0] }], // Get only the voluum campaign id
  };
};

const handleResponseError = (value: string) => {
  const defaultResponseError = {
    v_campaign_name: "error",
    v_conversions: "error",
    v_registered: "error",
    v_lead: "error",
    v_ftd: "error",
    v_cv: "error",
  };

  const finalResponse: Record<string, any> = {};
  for (const key in defaultResponseError) {
    finalResponse[key] = value;
  }
  return [finalResponse];
};

const plusOneDay = (dateString: string) => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
};

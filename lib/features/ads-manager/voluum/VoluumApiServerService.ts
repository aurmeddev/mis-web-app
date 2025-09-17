import { appBaseUrl } from "@/lib/base-url/appBaseUrl";
import { VoluumApiConfig } from "./config/VoluumApiConfig";

export class VoluumApiServerService {
  private voluumApiConfig = new VoluumApiConfig();
  private handleResponseError = [
    {
      campaign_name: "error",
      conversions: "error",
      registered: "error",
      lead: "error",
      ftd: "error",
      cv: "error",
    },
  ];
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
    campaign_id: string;
    date_from: string;
    date_to: string;
  }) {
    /**
     * @param {string} customConversions6 - lead
     * @param {string} customConversions7 - ftd
     * @param {string} customConversions11 - registered
     * @param {string} conversions - leads/registered
     */
    const date_from = `${params.date_from}T00:00:00.000Z`;
    const date_to = `${plusOneDay(params.date_to)}T00:00:00.000Z`;

    const { isSuccess, data, message } = await this.getSessionToken();
    if (!isSuccess) {
      return {
        isSuccess,
        data: this.handleResponseError,
        message,
      };
    }

    const response = await fetch(
      `${this.voluumApiConfig.baseUrl}/report?include=ACTIVE&offset=0&tz=Asia/Singapore&column=cv&column=conversions&column=customConversions6&column=customConversions7&column=customConversions11&column=campaignName&groupBy=campaign&sort=campaignName&filter=${params.campaign_id}&limit=1&from=${date_from}&currency=USD&to=${date_to}&conversionTimeMode=CONVERSION&direction=DESC`,
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
      const { error } = await response.json();
      console.error(error);
      return {
        isSuccess: false,
        message: error.message,
        data: this.handleResponseError,
      };
    }

    const { rows } = await response.json();
    return {
      isSuccess: false,
      message: "Data has been fetched successfully!",
      data: formatAdInsightsResponseData(rows),
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
    campaignName: "campaign_name",
    conversions: "conversions",
    customConversions11: "registered",
    customConversions6: "lead",
    customConversions7: "ftd",
    cv: "cv",
  };

  const finalResponse: any = {};
  for (const oldKey in keyMapping) {
    const newKey = keyMapping[oldKey as keyof typeof keyMapping]; // Get the new key name from the mapping object.
    const value = formattedData[oldKey as keyof typeof keyMapping]; // Get the value from the original
    finalResponse[newKey] = value ?? "0";
  }

  return [finalResponse];
};

const plusOneDay = (dateString: string) => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
};

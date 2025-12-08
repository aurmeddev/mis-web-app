import { ApiResponseProps } from "@/database/query";
import { IExport, IExportGateway } from "../IExport";
import { VoluumApiConfig } from "../../voluum/config/VoluumApiConfig";
import { VoluumSessionServerApi } from "../../voluum/session/VoluumSessionServerApi";
interface IExportData {
  campaignId: string;
  campaignName: string;
  conversions: number;
  customConversions11: number;
  customConversions6: number;
  customConversions7: number;
  cv: number;
}
export class VoluumExportServerApi implements IExportGateway {
  private voluumApiConfig = new VoluumApiConfig();
  private RETRY_MAX_ATTEMPTS = 1;
  constructor(
    private session: {
      token: string;
    }
  ) {}
  exportData = async (params: IExport): Promise<ApiResponseProps> => {
    const { date_from, date_to, campaign_id } = params;
    const { isSuccess, message, data } = this.isValid(campaign_id);
    if (!isSuccess) {
      return {
        isSuccess,
        message,
        data,
      };
    }
    const filter = data[0].campaign_id;
    const response = await fetch(
      `${this.voluumApiConfig.baseUrl}/report?include=ACTIVE&offset=0&tz=Asia/Singapore&column=cv&column=conversions&column=customConversions6&column=customConversions7&column=customConversions11&column=campaignName&groupBy=campaign&sort=campaignName&filter=${filter}&limit=1&from=${date_from}&currency=USD&to=${date_to}&conversionTimeMode=CONVERSION&direction=DESC`,
      {
        method: "GET",
        headers: {
          "CWAUTH-TOKEN": this.session.token,
          "Content-type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      if (this.RETRY_MAX_ATTEMPTS === 2) {
        console.error("Maximum retry attempts reached.");
        return {
          isSuccess: false,
          message: "Maximum retry attempts reached.",
          data: [],
        };
      }

      const isUnauthorized = response.status === 401;
      if (isUnauthorized) {
        this.RETRY_MAX_ATTEMPTS++;
        return await this.retry(params);
      }

      console.error("Voluum server error", response);
      return {
        isSuccess: false,
        message: "Voluum server error",
        data: [],
      };
    }

    const { rows } = await response.json();
    if (rows.length === 0) {
      return {
        isSuccess: true,
        message: "No data found.",
        data: [],
      };
    }
    return {
      isSuccess: true,
      message: "Data has been fetched successfully!",
      data: this.format(rows),
    };
  };

  private retry = async (params: IExport) => {
    console.log("Voluum session is expired. Retrying...");
    const session = new VoluumSessionServerApi();
    const { isSuccess, message, data } = await session.generateToken();
    if (!isSuccess) {
      console.error("Voluum session error", message);
      return {
        isSuccess: false,
        message: "Voluum session error",
        data: [],
      };
    }

    const newToken: string = data[0].token;
    this.session.token = newToken;
    return await this.exportData(params);
  };

  private format = (data: IExportData[]) => {
    return data.map((item) => ({
      campaign_id: item.campaignId,
      campaign_name: item.campaignName,
      total_conversions: item.conversions,
      lead: item.customConversions6,
      ftd: item.customConversions7,
      registered: item.customConversions11,
      cv: item.cv,
    }));
  };

  private isValid = (text: string) => {
    if (!text) {
      return {
        isSuccess: false,
        message: "Login code or campaign/adset name is missing.",
        data: [],
      };
    }
    const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(text); // Check if the text contains only alphanumeric characters
    if (!isAlphanumeric) {
      // Old format with voluum campaign id
      return this.extractVoluumnCampaignId(text);
    }

    return {
      isSuccess: true,
      message: "Success.",
      data: [{ campaign_id: text.trim() }],
    };
  };

  private extractVoluumnCampaignId = (campaign_id: string) => {
    if (!campaign_id) {
      return {
        isSuccess: false,
        message: "Voluum campaign ID is missing.",
        data: [],
      };
    }

    if (campaign_id.split("_").length !== 6) {
      return {
        isSuccess: false,
        message: "Invalid old campaign naming format.",
        data: [],
      };
    }

    return {
      isSuccess: true,
      message: "Success.",
      data: [{ campaign_id: campaign_id.split("_")[5].split(" ")[0] }], // Get only the voluum campaign id
    };
  };
}

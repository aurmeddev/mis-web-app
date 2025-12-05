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
  constructor(
    private session: {
      token: string;
    }
  ) {}
  exportData = async (params: IExport): Promise<ApiResponseProps> => {
    const { date_from, date_to, campaign_id } = params;
    const filter = campaign_id;
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
      const isUnauthorized = response.status === 401;
      if (isUnauthorized) {
        console.log("Voluum session is expired. Retrying...");
        const session = new VoluumSessionServerApi();
        const authVoluum = await session.generateToken();
        if (!authVoluum.isSuccess) {
          console.error("Voluum session error", authVoluum.message);
          return {
            isSuccess: false,
            message: "Voluum session error",
            data: [],
            // data: handleCustomVoluumResponse({ status: "Voluum server error" }),
          };
        }

        const newToken: string = authVoluum.data[0].token;
        this.session.token = newToken;
        return await this.exportData(params);
      }

      console.error("Voluum server error", response);
      return {
        isSuccess: false,
        message: "Voluum server error",
        data: [],
        // data: handleCustomVoluumResponse({ status: "Voluum server error" }),
      };
    }

    const { rows } = await response.json();
    if (rows.length === 0) {
      return {
        isSuccess: true,
        message: "No data found.",
        data: [],
        // data: handleCustomVoluumResponse({ status: "Archived" }),
      };
    }
    return {
      isSuccess: true,
      message: "Data has been fetched successfully!",
      data: this.format(rows),
    };
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
}

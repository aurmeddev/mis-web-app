import { ApiResponseProps } from "@/database/query";
import { ICostUpdate, ICostUpdateGateway } from "../ICostUpdate";
import { VoluumApiConfig } from "../../voluum/config/VoluumApiConfig";
interface IRequestBody {
  from: string;
  to: string;
  timeZone: string;
  campaignId: string;
  cost: number;
  currency: string;
}
export class VoluumCostUpdateServerApi implements ICostUpdateGateway {
  private timeZone = "Asia/Singapore";
  private currency = "USD";
  private voluumApiConfig = new VoluumApiConfig();
  constructor(
    private session: {
      token: string;
    }
  ) {}
  costUpdate = async (params: ICostUpdate): Promise<ApiResponseProps> => {
    const { spend, date_from, date_to, campaign_id } = params;
    const requestBody: IRequestBody = {
      from: date_from,
      to: date_to,
      campaignId: campaign_id,
      timeZone: this.timeZone,
      cost: spend,
      currency: this.currency,
    };

    try {
      const response = await fetch(
        `${this.voluumApiConfig.baseUrl}/report/manual-cost`,
        {
          method: "POST",
          headers: {
            "CWAUTH-TOKEN": this.session.token,
            "Content-type": "application/json",
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      console.log("Cost updated successfully!");
      console.log("campaignId:", campaign_id, "spend:", spend);
      console.log("spend:", spend);
      return {
        isSuccess: true,
        message: "Cost updated successfully!",
        data: [{ status: "COST_UPDATED" }],
      };
    } catch (error: any) {
      console.log(error);
      const errorString = error.toString();
      const status: any = errorString.includes("NO_VISITS_PERIOD")
        ? "NO_VISITS_PERIOD"
        : errorString.includes("TIME_RANGE_EXCEED_LAST_HOUR")
        ? "TIME_RANGE_EXCEED_LAST_HOUR"
        : "COST_UPDATE_ERROR";
      return {
        isSuccess: false,
        message: "Cost update error!",
        data: [{ status }],
      };
    }
  };
}

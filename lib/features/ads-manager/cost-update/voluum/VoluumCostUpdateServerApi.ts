import { ApiResponseProps } from "@/database/query";
import { ICostUpdate, ICostUpdateGateway } from "../ICostUpdate";
import { VoluumApiConfig } from "../../voluum/config/VoluumApiConfig";
import { DatetimeUtils } from "@/lib/utils/date/DatetimeUtils";
import { VoluumSessionServerApi } from "../../voluum/session/VoluumSessionServerApi";
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
  private RETRY_MAX_ATTEMPTS = 1;
  constructor(
    private session: {
      token: string;
    }
  ) {}
  costUpdate = async (params: ICostUpdate): Promise<ApiResponseProps> => {
    const { spend, date_from, date_to, campaign_id } = params;
    const dateRanges = {
      from: `${date_from}T00:00:00.000`,
      to: `${new DatetimeUtils().plusOneDay(date_to)}T00:00:00.000`,
    };
    const requestBody: IRequestBody = {
      from: dateRanges.from,
      to: dateRanges.to,
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

  private retry = async (params: ICostUpdate) => {
    console.log("Voluum session is expired. Retrying...");
    const session = new VoluumSessionServerApi();
    const { isSuccess, message, data } = await session.generateToken();
    if (!isSuccess) {
      console.error("Voluum session error", message);
      return {
        isSuccess: false,
        message: "Voluum session error",
        data: [{ status: "Voluum session error" }],
      };
    }

    const newToken: string = data[0].token;
    this.session.token = newToken;
    return await this.costUpdate(params);
  };
}

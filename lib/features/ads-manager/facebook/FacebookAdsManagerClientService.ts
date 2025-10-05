import { ApiResponseProps } from "@/database/query";
import { appBaseUrl } from "@/lib/base-url/appBaseUrl";
import { ObjectUtils } from "@/lib/utils/object/ObjectUtils";
import {
  BaseFacebookAdsManagerServiceProps,
  UpdateDeliveryStatusProps,
} from "./type/FacebookMarketingApiProps";

type adCheckerProps = Omit<
  BaseFacebookAdsManagerServiceProps,
  "time_ranges" | "filtering"
>;
type adInsightsProps = Omit<
  BaseFacebookAdsManagerServiceProps,
  "time_ranges"
> & {
  date_from?: string;
  date_to?: string;
  isVoluumIncluded: boolean;
};
type accessTokenDebuggerProps = Omit<
  BaseFacebookAdsManagerServiceProps,
  "time_ranges" | "filtering"
>;
export class FacebookAdsManagerClientService {
  async adChecker(params: adCheckerProps): Promise<ApiResponseProps> {
    const objUtil = new ObjectUtils();
    const payload = objUtil.removeInvalidKeys({
      data: params,
      isStrictMode: true,
    });
    const response = await fetch(`${appBaseUrl}/api/ads-manager/ad-checker`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return await response.json();
  }

  async adCheckerRefresh(
    params: adCheckerProps & { ad_account_id: string }
  ): Promise<ApiResponseProps> {
    const objUtil = new ObjectUtils();
    const payload = objUtil.removeInvalidKeys({
      data: params,
      isStrictMode: true,
    });
    const response = await fetch(
      `${appBaseUrl}/api/ads-manager/ad-checker/refresh`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    return await response.json();
  }

  async adInsights(params: adInsightsProps): Promise<ApiResponseProps> {
    const objUtil = new ObjectUtils();
    const payload = objUtil.removeInvalidKeys({
      data: params,
      isStrictMode: true,
    });
    const response = await fetch(`${appBaseUrl}/api/ads-manager/ad-insights`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return await response.json();
  }

  async adInsightsRefresh(
    params: adInsightsProps & { ad_account_id: string }
  ): Promise<ApiResponseProps> {
    const objUtil = new ObjectUtils();
    const payload = objUtil.removeInvalidKeys({
      data: params,
      isStrictMode: true,
    });
    const response = await fetch(
      `${appBaseUrl}/api/ads-manager/ad-insights/refresh`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    return await response.json();
  }

  async accessTokenDebugger(
    params: accessTokenDebuggerProps
  ): Promise<ApiResponseProps> {
    const objUtil = new ObjectUtils();
    const payload = objUtil.removeInvalidKeys({
      data: params,
      isStrictMode: true,
    });
    const response = await fetch(
      `${appBaseUrl}/api/ads-manager/access-token-debugger`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    return await response.json();
  }

  async updateDeliveryStatus(
    params: UpdateDeliveryStatusProps & {
      access_token: string;
    }
  ): Promise<ApiResponseProps> {
    const response = await fetch(
      `${appBaseUrl}/api/ads-manager/update-delivery-status`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(params),
      }
    );

    return await response.json();
  }
}

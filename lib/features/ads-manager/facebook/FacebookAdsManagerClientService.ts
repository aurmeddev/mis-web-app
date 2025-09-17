import { ApiResponseProps } from "@/database/dbConnection";
import { appBaseUrl } from "@/lib/base-url/appBaseUrl";
import { ObjectUtils } from "@/lib/utils/object/ObjectUtils";
import { BaseFacebookAdsManagerServiceProps } from "./type/FacebookMarketingApiProps";

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
}

import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
import { ApiResponseProps } from "@/database/dbConnection";
import { appBaseUrl } from "@/lib/base-url/appBaseUrl";

export class FacebookAdsManagerClientService {
  async adChecker(params: { access_token: string }): Promise<ApiResponseProps> {
    const searchParams = new SearchParamsManager();
    const searchQueryParams = searchParams.append(params);
    const response = await fetch(
      `${appBaseUrl}/api/ads-manager/ad-checker${searchQueryParams}`,
      {
        method: "GET",
        headers: {
          "Content-type": "application/json",
        },
        cache: "no-store",
      }
    );

    return await response.json();
  }
}

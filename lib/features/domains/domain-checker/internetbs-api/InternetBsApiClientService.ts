import { ApiResponseProps } from "@/database/query";
import { appBaseUrl } from "@/lib/base-url/appBaseUrl";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
export class InternetBsApiClientService {
  async getDomainInfo(params: { domain: string }): Promise<ApiResponseProps> {
    const searchParams = new SearchParamsManager();
    const searchQueryParams = searchParams.append(params);
    const response = await fetch(
      `${appBaseUrl}/api/internetbs/get-domain-info${searchQueryParams}`,
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

import { ApiResponseProps } from "@/database/dbConnection";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
export class InternetBsApiServerService {
  async getDomainInfo(params: { domain: string }): Promise<ApiResponseProps> {
    const searchParams = new SearchParamsManager();
    const searchQueryParams = searchParams.append(params);
    const baseURL = `${process.env.NEXT_AURMED_BACKEND_API_BASE_URL}`;
    const secretAuthKey = `Bearer ${process.env.NEXT_AURMED_BACKEND_SERVER_ACCESS_TOKEN}`;
    const response = await fetch(
      `${baseURL}/internetbs/domain-info${searchQueryParams}`,
      {
        method: "GET",
        headers: {
          "Content-type": "application/json",
          Authorization: secretAuthKey,
        },
        cache: "no-store",
      }
    );
    return await response.json();
  }
}

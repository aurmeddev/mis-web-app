import { ApiResponseProps } from "@/database/query";
import { IPostbackLogs, IExportPostbackLogs } from "./IPostbackLogs";
import { appBaseUrl } from "@/lib/base-url/appBaseUrl";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
export class ExportClientPostbackLogs implements IExportPostbackLogs {
  async export(params: IPostbackLogs): Promise<ApiResponseProps> {
    const searchParams = new SearchParamsManager();
    const searchQueryParams = searchParams.append(params);
    const response = await fetch(
      `${appBaseUrl}/api/postback/logs${searchQueryParams}`,
      {
        method: "GET",
        headers: {
          "Content-type": "application/json",
        },
        cache: "no-store",
      },
    );

    return await response.json();
  }

  async findByPixel(params: { pixel: string }): Promise<ApiResponseProps> {
    const searchParams = new SearchParamsManager();
    const searchQueryParams = searchParams.append(params);
    const response = await fetch(
      `${appBaseUrl}/api/postback/logs/find-by-pixel${searchQueryParams}`,
      {
        method: "GET",
        headers: {
          "Content-type": "application/json",
        },
        cache: "no-store",
      },
    );

    return await response.json();
  }
}

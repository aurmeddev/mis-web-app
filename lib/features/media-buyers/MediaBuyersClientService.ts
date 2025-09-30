import { ApiResponseProps } from "@/database/query";
import { GetAllMediaBuyersProps } from "./type/MediaBuyersProps";
import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
import { appBaseUrl } from "@/lib/base-url/appBaseUrl";

export class MediaBuyersClientService {
  async getAll(
    params: GetAllMediaBuyersProps
  ): Promise<ApiResponseProps & { pagination?: PaginationProps }> {
    const searchParams = new SearchParamsManager();
    const searchQueryParams = searchParams.append(params);
    const response = await fetch(
      `${appBaseUrl}/api/media-buyers/get-all${searchQueryParams}`,
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

import { ApiResponseProps } from "@/database/dbConnection";
import { GetAllGeosProps } from "./type/GeosProps";
import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
import { appBaseUrl } from "@/lib/base-url/appBaseUrl";

export class GeosClientService {
  async getAll(
    params: GetAllGeosProps
  ): Promise<ApiResponseProps & { pagination?: PaginationProps }> {
    const searchParams = new SearchParamsManager();
    const searchQueryParams = searchParams.append(params);
    const response = await fetch(
      `${appBaseUrl}/api/geos/get-all${searchQueryParams}`,
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

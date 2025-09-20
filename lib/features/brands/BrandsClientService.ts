import { ApiResponseProps } from "@/database/dbConnection";
import { GetAllBrandsProps } from "./type/BrandsServiceProps";
import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
import { appBaseUrl } from "@/lib/base-url/appBaseUrl";

export class BrandsClientService {
  async getAll(
    params: GetAllBrandsProps
  ): Promise<ApiResponseProps & { pagination?: PaginationProps }> {
    const searchParams = new SearchParamsManager();
    const searchQueryParams = searchParams.append(params);
    const response = await fetch(
      `${appBaseUrl}/api/brands/get-all${searchQueryParams}`,
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

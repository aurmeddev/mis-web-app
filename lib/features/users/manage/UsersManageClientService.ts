import { ApiResponseProps } from "@/database/query";
import { GetAllManageUsersProps } from "./type/ManageUsersProps";
import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";
import { appBaseUrl } from "@/lib/base-url/appBaseUrl";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";

export class UsersManageClientService {
  async getAllUsers(
    params: GetAllManageUsersProps
  ): Promise<ApiResponseProps & { pagination?: PaginationProps }> {
    const searchParams = new SearchParamsManager();
    const searchQueryParams = searchParams.append(params);
    const response = await fetch(
      `${appBaseUrl}/api/users/manage/get-all${searchQueryParams}`,
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
  async getDistinctRecruiters(): Promise<ApiResponseProps> {
    const response = await fetch(
      `${appBaseUrl}/api/users/get-distinct-recruiters`,
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

import { ApiResponseProps } from "@/database/query";
import {
  GetAllUsersProps,
  PostUsersProps,
  FindUsersProps,
  ToggleStatusUsersProps,
  UpdateUsersProps,
} from "./type/UsersProps";
import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";
import { appBaseUrl } from "@/lib/base-url/appBaseUrl";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";

export class UsersClientController {
  async getAllUsers(
    params: GetAllUsersProps
  ): Promise<ApiResponseProps & { pagination?: PaginationProps }> {
    const searchParams = new SearchParamsManager();
    const searchQueryParams = searchParams.append(params);
    const response = await fetch(
      `${appBaseUrl}/api/users/get-all${searchQueryParams}`,
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

  async post(params: PostUsersProps): Promise<ApiResponseProps> {
    try {
      const response = await fetch(`${appBaseUrl}/api/users/post`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(params),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return await response.json();
    } catch (error: any) {
      const errorResponse = JSON.parse(error.message);
      return {
        isSuccess: false,
        message: errorResponse.message.includes("exists")
          ? errorResponse.message
          : "Something went wrong! Please try again.",
        data: [],
      };
    }
  }

  async find(params: FindUsersProps): Promise<ApiResponseProps> {
    const { searchKeyword, dynamicSearchPayload, ...searchParamsUtils } =
      params;
    const searchParams = new SearchParamsManager();
    const searchQueryParams = searchParams.append(searchParamsUtils);
    const response = await fetch(
      `${appBaseUrl}/api/users/find/${searchKeyword}${searchQueryParams}`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(dynamicSearchPayload || {}),
      }
    );

    return await response.json();
  }

  async toggleStatus(
    params: ToggleStatusUsersProps
  ): Promise<ApiResponseProps> {
    const response = await fetch(`${appBaseUrl}/api/users/update/status`, {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(params),
    });

    return await response.json();
  }

  async update(params: UpdateUsersProps): Promise<ApiResponseProps> {
    const response = await fetch(`${appBaseUrl}/api/users/update`, {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(params),
    });

    return await response.json();
  }
}

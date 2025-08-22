import { ApiResponseProps } from "@/database/dbConnection";
import { appBaseUrl } from "@/lib/base-url/appBaseUrl";
import {
  FindApProfilesProps,
  GetAllApProfilesProps,
  PostApProfilesProps,
  ToggleApProfilesStatusProps,
  UpdateApProfilesProps,
} from "./type/ApProfilesProps";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";

export class ApProfilesService {
  async post(params: PostApProfilesProps): Promise<ApiResponseProps> {
    try {
      const response = await fetch(`${appBaseUrl}/api/ap-profiles/post`, {
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

  async update(params: UpdateApProfilesProps): Promise<ApiResponseProps> {
    const { id, ...payload } = params;
    const response = await fetch(`${appBaseUrl}/api/ap-profiles/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return await response.json();
  }

  async toggleStatus(
    params: ToggleApProfilesStatusProps
  ): Promise<ApiResponseProps> {
    const { id, ...payload } = params;
    const response = await fetch(
      `${appBaseUrl}/api/ap-profiles/update/${id}/status`,
      {
        method: "PUT",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    return await response.json();
  }

  async find(params: FindApProfilesProps): Promise<ApiResponseProps> {
    const { searchKey } = params;
    const response = await fetch(
      `${appBaseUrl}/api/ap-profiles/find/${searchKey}`,
      {
        method: "GET",
        headers: {
          "Content-type": "application/json",
        },
      }
    );

    return await response.json();
  }

  async getAll(
    params: GetAllApProfilesProps
  ): Promise<ApiResponseProps & { pagination?: PaginationProps }> {
    const searchParams = new SearchParamsManager();
    const searchQueryParams = searchParams.append(params);
    const response = await fetch(
      `${appBaseUrl}/api/ap-profiles/get-all${searchQueryParams}`,
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

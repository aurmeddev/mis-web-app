import { appBaseUrl } from "@/lib/base-url/appBaseUrl";
import {
  PostDomainManagerServiceProps,
  FindDomainManagerServiceProps,
  UpdateDomainManagerServiceProps,
} from "./type/DomainManagerServiceProps";
import { ApiResponseProps } from "@/database/dbConnection";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";

export class DomainManagerClientService {
  async post(params: PostDomainManagerServiceProps): Promise<ApiResponseProps> {
    try {
      const response = await fetch(
        `${appBaseUrl}/api/ads-managerdomains/post`,
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(params),
        }
      );
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

  async find(params: FindDomainManagerServiceProps): Promise<ApiResponseProps> {
    const { searchKeyword, dynamicSearchPayload, ...searchParamsUtils } =
      params;
    const searchParams = new SearchParamsManager();
    const searchQueryParams = searchParams.append(searchParamsUtils);
    const response = await fetch(
      `${appBaseUrl}/api/ads-manager/domains/find/${searchKeyword}${searchQueryParams}`,
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

  async update(
    params: UpdateDomainManagerServiceProps
  ): Promise<ApiResponseProps> {
    const { id, ...payload } = params;
    const response = await fetch(`${appBaseUrl}/api/fb-accounts/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return await response.json();
  }
}

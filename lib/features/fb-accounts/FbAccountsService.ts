import { ApiResponseProps } from "@/database/query";
import {
  FindFbAccountsProps,
  GetAllFbAccountsProps,
  PostFbAccountsProps,
  PostRecoveryCodesProps,
  UpdateFbAccountsProps,
} from "./type/FbAccountsProps";
import { appBaseUrl } from "@/lib/base-url/appBaseUrl";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";

export class FbAccountsService {
  async post(params: PostFbAccountsProps): Promise<ApiResponseProps> {
    try {
      const response = await fetch(`${appBaseUrl}/api/fb-accounts/post`, {
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

  async update(params: UpdateFbAccountsProps): Promise<ApiResponseProps> {
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

  async find(params: FindFbAccountsProps): Promise<ApiResponseProps> {
    const { searchKeyword, dynamicSearchPayload, ...searchParamsUtils } =
      params;
    const searchParams = new SearchParamsManager();
    const searchQueryParams = searchParams.append(searchParamsUtils);
    const response = await fetch(
      `${appBaseUrl}/api/fb-accounts/find/${searchKeyword}${searchQueryParams}`,
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

  async getAll(
    params: GetAllFbAccountsProps
  ): Promise<ApiResponseProps & { pagination?: PaginationProps }> {
    const searchParams = new SearchParamsManager();
    const searchQueryParams = searchParams.append(params);
    const response = await fetch(
      `${appBaseUrl}/api/fb-accounts/get-all${searchQueryParams}`,
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

  async postRecoveryCodes(
    params: PostRecoveryCodesProps
  ): Promise<ApiResponseProps> {
    const { fb_account_id, recovery_code } = params;
    let recovery_code_format: string[] = [];
    // Validate the recovery code format
    if (recovery_code.includes(" ")) {
      recovery_code_format = recovery_code.split(" ");
    } else if (recovery_code) {
      recovery_code_format = recovery_code.split("/");
    }
    // Execute the query to insert recovery codes into the database simulataneously
    await Promise.allSettled(
      recovery_code_format.map((value) => {
        if (value) {
          // Check if value is not empty
          fetch(`${appBaseUrl}/api/ap-profiles/recovery-codes`, {
            method: "POST",
            headers: {
              "Content-type": "application/json",
            },
            body: JSON.stringify({
              fb_account_id,
              recovery_code: value,
            }),
          });
        }
      })
    );
    return {
      isSuccess: true,
      message: "Recovery codes have been submitted successfully.",
      data: [],
    };
  }
}

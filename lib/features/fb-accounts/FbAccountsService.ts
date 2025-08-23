import { ApiResponseProps } from "@/database/dbConnection";
import {
  FindFbAccountsProps,
  PostFbAccountsProps,
  PostRecoveryCodesProps,
} from "./type/FbAccountsProps";
import { appBaseUrl } from "@/lib/base-url/appBaseUrl";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";

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

  async find(params: FindFbAccountsProps): Promise<ApiResponseProps> {
    const searchParams = new SearchParamsManager();
    const searchQueryParams = searchParams.append(params.method);
    const response = await fetch(
      `${appBaseUrl}/api/fb-accounts/find/${params.searchKey}${searchQueryParams}`,
      {
        method: "GET",
        headers: {
          "Content-type": "application/json",
        },
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

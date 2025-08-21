import { appBaseUrl } from "@/lib/base-url/appBaseUrl";
import { SearchParamsManager } from "../../../utils/search-params/SearchParamsManager";
import { PaginationParams } from "../../pagination/type/PaginationProps";
import {
  FindUserIpWhitelistParams,
  PaginationUserIpWhitelistProps,
  PostUserIpWhitelistParams,
  UpdateUserIpWhitelistInfoParams,
  UpdateUserIpWhitelistStatusParams,
} from "./type/UserIpWhitelistProps";
import { ApiResponseProps } from "@/database/dbConnection";
export class UserIpWhitelistClientService {
  async post(params: PostUserIpWhitelistParams): Promise<ApiResponseProps> {
    const payload = params;
    const response = await fetch(`${appBaseUrl}/api/auth/ip/whitelist/post`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return await response.json();
  }

  async setActive(
    params: UpdateUserIpWhitelistStatusParams
  ): Promise<ApiResponseProps> {
    const payload = params;
    const response = await fetch(
      `${appBaseUrl}/api/auth/ip/whitelist/update/status`,
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

  async update(
    params: UpdateUserIpWhitelistInfoParams
  ): Promise<ApiResponseProps> {
    const payload = params;
    const response = await fetch(`${appBaseUrl}/api/auth/ip/whitelist/update`, {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return await response.json();
  }

  async find(params: FindUserIpWhitelistParams): Promise<ApiResponseProps> {
    const response = await fetch(
      `${appBaseUrl}/api/auth/ip/whitelist/find/${params.searchKey}`,
      {
        method: "GET",
        headers: {
          "Content-type": "application/json",
        },
      }
    );

    return await response.json();
  }

  async get(params: PaginationUserIpWhitelistProps): Promise<
    ApiResponseProps & {
      pagination?: PaginationParams;
    }
  > {
    const searchParams = new SearchParamsManager();
    const searchQueryParams = searchParams.append(params);
    const response = await fetch(
      `${appBaseUrl}/api/auth/ip/whitelist/get${searchQueryParams}`,
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

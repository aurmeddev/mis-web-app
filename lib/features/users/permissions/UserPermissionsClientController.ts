import { ApiResponseProps } from "@/database/query";
import {
  PostApProfileBrandPermissionsProps,
  PostUserBrandPermissionsProps,
  PostUserMenuPermissionsProps,
  UpdateUserBrandPermissionsProps,
} from "./type/UserPermissionsProps";
import { appBaseUrl } from "@/lib/base-url/appBaseUrl";

export class UserPermissionsClientController {
  async postUserMenuPermissions(
    params: PostUserMenuPermissionsProps
  ): Promise<ApiResponseProps> {
    const response = await fetch(
      `${appBaseUrl}/api/users/permissions/menus/post`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(params),
      }
    );
    return await response.json();
  }

  async postUserBrandPermissions(
    params: PostUserBrandPermissionsProps
  ): Promise<ApiResponseProps> {
    const response = await fetch(
      `${appBaseUrl}/api/users/permissions/brands/post`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(params),
      }
    );
    return await response.json();
  }

  async updateUserBrandPermissions(
    params: UpdateUserBrandPermissionsProps
  ): Promise<ApiResponseProps> {
    const response = await fetch(
      `${appBaseUrl}/api/users/permissions/brands/update`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(params),
      }
    );
    return await response.json();
  }

  async postApProfileBrandPermissions(
    params: PostApProfileBrandPermissionsProps
  ): Promise<ApiResponseProps> {
    const response = await fetch(
      `${appBaseUrl}/api/users/permissions/ap-profiles/post`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(params),
      }
    );
    return await response.json();
  }
}

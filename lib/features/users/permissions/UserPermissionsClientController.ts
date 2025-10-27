import { ApiResponseProps } from "@/database/query";
import { PostUserMenuPermissionsProps } from "./type/UserPermissionsProps";
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
}

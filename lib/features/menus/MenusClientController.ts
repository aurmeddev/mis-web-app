import { ApiResponseProps } from "@/database/query";
import { appBaseUrl } from "@/lib/base-url/appBaseUrl";

export class MenusClientController {
  async getAllMainMenus(): Promise<ApiResponseProps> {
    const response = await fetch(`${appBaseUrl}/api/menus/get-all`, {
      method: "GET",
      headers: {
        "Content-type": "application/json",
      },
      cache: "no-store",
    });

    return await response.json();
  }

  async getAllSubMenus(): Promise<ApiResponseProps> {
    const response = await fetch(`${appBaseUrl}/api/menus/sub-menus/get-all`, {
      method: "GET",
      headers: {
        "Content-type": "application/json",
      },
      cache: "no-store",
    });

    return await response.json();
  }
}

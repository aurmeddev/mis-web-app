import { ApiResponseProps } from "@/database/query";
import { appBaseUrl } from "@/lib/base-url/appBaseUrl";

export class TeamsClientController {
  async getAll(): Promise<ApiResponseProps> {
    const response = await fetch(`${appBaseUrl}/api/teams/get-all`, {
      method: "GET",
      headers: {
        "Content-type": "application/json",
      },
      cache: "no-store",
    });

    return await response.json();
  }
}

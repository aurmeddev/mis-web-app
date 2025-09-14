import { ApiResponseProps } from "@/database/dbConnection";
import { appBaseUrl } from "@/lib/base-url/appBaseUrl";

export class FacebookAdsManagerClientService {
  async adChecker(params: { access_token: string }): Promise<ApiResponseProps> {
    const response = await fetch(`${appBaseUrl}/api/ads-manager/ad-checker`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(params),
    });

    return await response.json();
  }

  async accessTokenDebugger(params: {
    access_token: string;
  }): Promise<ApiResponseProps> {
    const response = await fetch(
      `${appBaseUrl}/api/ads-manager/access-token-debugger`,
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

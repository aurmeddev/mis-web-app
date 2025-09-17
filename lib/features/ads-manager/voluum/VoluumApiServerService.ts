import { appBaseUrl } from "@/lib/base-url/appBaseUrl";
// import { VoluumApiConfig } from "./config/VoluumApiConfig";

export class VoluumApiServerService {
  //   private voluumApiConfig = new VoluumApiConfig();
  async getSessionToken() {
    const response = await fetch(`${appBaseUrl}/api/voluum/get-session`, {
      method: "GET",
      headers: {
        "Content-type": "application/json",
      },
      next: { revalidate: 5400 }, // Revalidate every 1.5 hours or 5400 seconds
    });

    const { isSuccess, data, message } = await response.json();
    return {
      isSuccess,
      data,
      message,
    };
  }
}

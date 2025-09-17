import { VoluumApiConfig } from "./config/VoluumApiConfig";

export class VoluumApiServerService {
  private voluumApiConfig = new VoluumApiConfig();
  constructor(private config: { accessId: string; accessKey: string }) {
    this.config = config;
  }

  async getSessionToken() {
    const response = await fetch(
      `${this.voluumApiConfig.baseUrl}/auth/access/session`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(this.config),
      }
    );

    if (!response.ok) {
      const { error } = await response.json();
      console.error(error);
      return {
        isSuccess: false,
        message: error.message,
        data: [],
      };
    }

    return await response.json();
  }
}

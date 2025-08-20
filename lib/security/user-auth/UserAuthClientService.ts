import { appBaseUrl } from "../../base-url/appBaseUrl";
import { UserLoginParams } from "./type/UserAuthProps";

export class UserAuthClientService {
  async login(params: UserLoginParams) {
    const payload = params;
    const response = await fetch(`${appBaseUrl}/api/auth/login`, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return await response.json();
  }
  async logout() {
    const response = await fetch(`${appBaseUrl}/api/auth/logout`, {
      method: "POST",
    });

    return await response.json();
  }

  async keepSessionAlive() {
    const response = await fetch(`${appBaseUrl}/api/auth/session-alive`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
    });

    return await response.json();
  }

  async getUserIpAddress() {
    try {
      const response = await fetch(`${appBaseUrl}/api/auth/ip/get`, {
        method: "GET",
        headers: {
          "Content-type": "application/json",
        },
      });

      return await response.json();
    } catch (error: any) {
      console.error(error);
      return {
        isSuccess: false,
        message: "Something went wrong! Please reload the page and try again.",
        data: [],
      };
    }
  }
}

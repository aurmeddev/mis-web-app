import { appBaseUrl } from "@/lib/base-url/appBaseUrl";
import { PostDomainManagerServiceProps } from "./type/DomainManagerServiceProps";
import { ApiResponseProps } from "@/database/dbConnection";

export class DomainManagerClientService {
  async post(params: PostDomainManagerServiceProps): Promise<ApiResponseProps> {
    try {
      const response = await fetch(`${appBaseUrl}/api/domains/post`, {
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
}

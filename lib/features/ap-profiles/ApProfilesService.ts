import { ApiResponseProps } from "@/database/dbConnection";
import { appBaseUrl } from "@/lib/base-url/appBaseUrl";
import { PostApProfilesProps } from "./type/ApProfilesProps";

export class ApProfilesService {
  async post(params: PostApProfilesProps): Promise<ApiResponseProps> {
    try {
      const response = await fetch(`${appBaseUrl}/api/ap-profiles/post`, {
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
        message: errorResponse.message.includes("duplicate entry")
          ? errorResponse.message
          : "Something went wrong! Please try again.",
        data: [],
      };
    }
  }
}

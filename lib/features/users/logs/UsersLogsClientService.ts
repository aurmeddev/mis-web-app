import { ApiResponseProps } from "@/database/dbConnection";
import { PostUsersLogsProps } from "./type/UsersLogsProps";
import { appBaseUrl } from "@/lib/base-url/appBaseUrl";

export class UsersLogsClientService {
  async post(
    params: Omit<PostUsersLogsProps, "created_by">
  ): Promise<ApiResponseProps> {
    try {
      const response = await fetch(`${appBaseUrl}/api/users/logs/post`, {
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
      console.log(JSON.parse(error.message));
      return {
        isSuccess: false,
        message: "Something went wrong! Please try again.",
        data: [],
      };
    }
  }
}

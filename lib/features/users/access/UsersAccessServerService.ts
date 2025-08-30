import { ApiResponseProps } from "@/database/dbConnection";
import { PostUsersAccessProps } from "./type/UsersAccessProps";

export class UsersAccessServerService {
  async post(params: PostUsersAccessProps): Promise<ApiResponseProps> {
    return {
      isSuccess: true,
      message: "",
      data: [params],
    };
  }
}

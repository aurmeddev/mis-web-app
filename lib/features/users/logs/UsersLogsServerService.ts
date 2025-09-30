import { ApiResponseProps, query } from "@/database/query";
import { PostUsersLogsProps } from "./type/UsersLogsProps";
import { MySqlUtils } from "@/lib/utils/mysql/MySqlUtils";
import { ObjectUtils } from "@/lib/utils/object/ObjectUtils";

export class UsersLogsServerService {
  async post(params: PostUsersLogsProps): Promise<ApiResponseProps> {
    const mysqlUtils = new MySqlUtils();
    const objUtil = new ObjectUtils();
    const payload = objUtil.removeInvalidKeys({
      data: params,
      isStrictMode: true,
    });
    const { columns, values, questionMarksValue } =
      mysqlUtils.generateInsertQuery(payload);
    const queryString = `INSERT INTO User_Logs ${columns} ${questionMarksValue}`;
    console.log(queryString);
    console.log(values);

    // Execute the query to insert data into the database
    try {
      await query({
        query: queryString,
        values: values,
      });

      return {
        isSuccess: true,
        message: "Log has been saved successfully.",
        data: [],
      };
    } catch (error: any) {
      console.error(error);
      return {
        isSuccess: false,
        message: "Something went wrong! Please try again.",
        data: [],
      };
    }
  }
}

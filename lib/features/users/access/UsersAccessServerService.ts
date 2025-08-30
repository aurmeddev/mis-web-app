import { ApiResponseProps, query } from "@/database/dbConnection";
import { PostUsersAccessProps } from "./type/UsersAccessProps";
import { MySqlUtils } from "@/lib/utils/mysql/MySqlUtils";

export class UsersAccessServerService {
  async post(params: PostUsersAccessProps): Promise<ApiResponseProps> {
    const { user_id, ...rest } = params;
    const { main_menu } = rest;
    for (const main of main_menu) {
      const mainMenuAccessResponse = await PostDataUserAccess({
        dbTableName: "User_Access_Main_Menus",
        payload: {
          user_id: user_id,
          main_menu_id: main.main_menu_id,
        },
      });

      if (!mainMenuAccessResponse.isSuccess) {
        return {
          isSuccess: false,
          message: mainMenuAccessResponse.message,
          data: [],
        };
      }
      if (main.sub_menu.length > 0)
        for (const sub of main.sub_menu) {
          const subMenuAccessResponse = await PostDataUserAccess({
            dbTableName: "User_Access_Sub_Menus",
            payload: {
              user_id: user_id,
              main_menu_id: main.main_menu_id,
              sub_menu_id: sub.sub_menu_id,
            },
          });

          if (!subMenuAccessResponse.isSuccess) {
            return {
              isSuccess: false,
              message: subMenuAccessResponse.message,
              data: [],
            };
          }
        }
    }

    return {
      isSuccess: true,
      message: "Data have been submitted successfully.",
      data: [params],
    };
  }
}

type PostDataUserAccessProps = {
  dbTableName: string;
  payload:
    | {
        user_id: number;
        main_menu_id: number;
      }
    | {
        user_id: number;
        sub_menu_id: number;
        main_menu_id: number;
      };
};

const PostDataUserAccess = async (params: PostDataUserAccessProps) => {
  const { dbTableName, payload } = params;
  const mysql = new MySqlUtils();
  const { columns, values, questionMarksValue } =
    mysql.generateInsertQuery(payload);
  const queryString = `INSERT INTO ${dbTableName} ${columns} ${questionMarksValue}`;
  console.log(queryString);
  console.log(values);

  // Execute the query to insert data into the database
  try {
    const response: any = await query({
      query: queryString,
      values: values,
    });

    return {
      isSuccess: true,
      message: "Data have been submitted successfully.",
      data: response,
    };
  } catch (error: any) {
    console.error(error);
    return {
      isSuccess: false,
      message: "Something went wrong! Please try again.",
      data: [],
    };
  }
};

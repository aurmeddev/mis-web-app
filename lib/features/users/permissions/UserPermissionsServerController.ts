import { ApiResponseProps, query } from "@/database/query";
import {
  VerifyUserMenuPermissionsProps,
  VerifyUserBrandPermissionsProps,
  PostUserMenuPermissionsProps,
  PostUserBrandPermissionsProps,
} from "./type/UserPermissionsProps";
import { MySqlUtils } from "@/lib/utils/mysql/MySqlUtils";
import { SearchKeywordService } from "../../search-keyword/SearchKeywordService";

export class UserPermissionsServerController {
  async postUserMenuPermissions(
    params: PostUserMenuPermissionsProps
  ): Promise<ApiResponseProps> {
    const { user_id, ...rest } = params;
    if (!Array.isArray(user_id)) {
      return {
        isSuccess: false,
        message: "The user_id value is invalid. It must be an array.",
        data: [],
      };
    }
    const { main_menu } = rest;
    const result: any[] = [];
    const customSearchParams = new URLSearchParams();
    customSearchParams.set("method", "find-one");
    customSearchParams.set("condition", "all");

    for (const id of user_id) {
      for (const main of main_menu) {
        const mainMenuPayload = {
          user_id: Number(id),
          main_menu_id: main.main_menu_id,
        };
        const validationResponse = await this.verifyUserMenuPermissions({
          searchKeyword: "validation",
          requestUrlSearchParams: customSearchParams,
          payload: mainMenuPayload,
        });

        if (!validationResponse.isSuccess) {
          return {
            isSuccess: false,
            message: validationResponse.message,
            data: [],
          };
        }

        const userHasAccessAlready = validationResponse.data.length > 0;
        if (userHasAccessAlready) {
          result.push({
            ...mainMenuPayload,
            status:
              "Unable to proceed. The user already has access to the main menu.",
          });
        } else {
          const mainMenuAccessResponse = await handlePostUserPermissions({
            dbTableName: "User_Access_Main_Menus",
            payload: mainMenuPayload,
          });

          if (!mainMenuAccessResponse.isSuccess) {
            return {
              isSuccess: false,
              message: mainMenuAccessResponse.message,
              data: [],
            };
          }

          result.push({
            ...mainMenuPayload,
            status: "Success!",
          });
        }

        if (main.sub_menu && main.sub_menu.length > 0) {
          for (const sub of main.sub_menu) {
            const subMenuPayload = {
              user_id: Number(id),
              main_menu_id: main.main_menu_id,
              sub_menu_id: sub.sub_menu_id,
            };
            const validationResponse = await this.verifyUserMenuPermissions({
              searchKeyword: "validation",
              requestUrlSearchParams: customSearchParams,
              payload: subMenuPayload,
            });

            if (!validationResponse.isSuccess) {
              return {
                isSuccess: false,
                message: validationResponse.message,
                data: [],
              };
            }
            const userHasAccessAlready = validationResponse.data.length > 0;
            if (userHasAccessAlready) {
              result.push({
                ...subMenuPayload,
                status:
                  "Unable to proceed. The user already has access to the sub menu.",
              });
            } else {
              const subMenuAccessResponse = await handlePostUserPermissions({
                dbTableName: "User_Access_Sub_Menus",
                payload: subMenuPayload,
              });

              if (!subMenuAccessResponse.isSuccess) {
                return {
                  isSuccess: false,
                  message: subMenuAccessResponse.message,
                  data: [],
                };
              }

              result.push({
                ...subMenuPayload,
                status: "Success!",
              });
            }
          }
        }
      }
    }

    console.log("Add User Menus Permissions:");
    console.log(result);
    return {
      isSuccess: true,
      message: "Data have been submitted successfully.",
      data: [],
    };
  }

  async verifyUserMenuPermissions(params: VerifyUserMenuPermissionsProps) {
    const { searchKeyword, payload, requestUrlSearchParams } = params;

    let validPayload: object = {};
    try {
      validPayload = payload;
    } catch (error) {
      return {
        isSuccess: false,
        message: "Invalid JSON payload.",
        data: [],
      };
    }
    const searchApi = new SearchKeywordService();
    const { queryString, values, isSuccess, message } = searchApi.search({
      searchKeyword,
      requestUrlSearchParams: requestUrlSearchParams,
      dynamicSearchPayload: validPayload,
      databaseTableName: "v_UserAccessMenus",
      staticSearchField: "user_id",
    });

    if (!isSuccess) {
      return {
        isSuccess,
        message,
        data: [],
      };
    }

    // Execute the query to find data in the database
    try {
      const response: any = await query({
        query: queryString,
        values: values,
      });

      if (response.length === 0) {
        return {
          isSuccess: true,
          message: "No data found.",
          data: [],
        };
      }

      return {
        isSuccess: true,
        message: "Data fetched successfully.",
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
  }

  async postUserBrandPermissions(params: PostUserBrandPermissionsProps) {
    const { user_id, brand_id } = params;
    if (!Array.isArray(user_id)) {
      return {
        isSuccess: false,
        message: "The user_id value is invalid. It must be an array.",
        data: [],
      };
    }

    const result: any[] = [];
    const customSearchParams = new URLSearchParams();
    customSearchParams.set("method", "find-one");
    customSearchParams.set("condition", "all");
    for (const id of user_id) {
      for (const brandId of brand_id) {
        const permissionsPayload = {
          user_id: Number(id),
          brand_id: brandId,
        };
        const validationResponse = await this.verifyUserBrandPermissions({
          searchKeyword: "validation",
          requestUrlSearchParams: customSearchParams,
          payload: permissionsPayload,
        });

        if (!validationResponse.isSuccess) {
          return {
            isSuccess: false,
            message: validationResponse.message,
            data: [],
          };
        }

        const userHasAccessAlready = validationResponse.data.length > 0;
        if (userHasAccessAlready) {
          result.push({
            ...permissionsPayload,
            status:
              "Unable to proceed. The user already has access to the brand.",
          });
        } else {
          const permissionsResponse = await handlePostUserPermissions({
            dbTableName: "User_Access_Brands",
            payload: permissionsPayload,
          });

          if (!permissionsResponse.isSuccess) {
            return {
              isSuccess: false,
              message: permissionsResponse.message,
              data: [],
            };
          }

          result.push({
            ...permissionsPayload,
            status: "Success!",
          });
        }
      }
    }

    console.log("Add User Brand Permissions:");
    console.log(result);
    return {
      isSuccess: true,
      message: "Data have been submitted successfully.",
      data: [],
    };
  }

  async verifyUserBrandPermissions(params: VerifyUserBrandPermissionsProps) {
    const { searchKeyword, payload, requestUrlSearchParams } = params;

    let validPayload: object = {};
    try {
      validPayload = payload;
    } catch (error) {
      return {
        isSuccess: false,
        message: "Invalid JSON payload.",
        data: [],
      };
    }
    const searchApi = new SearchKeywordService();
    const { queryString, values, isSuccess, message } = searchApi.search({
      searchKeyword,
      requestUrlSearchParams: requestUrlSearchParams,
      dynamicSearchPayload: validPayload,
      databaseTableName: "User_Access_Brands",
      staticSearchField: "user_id",
    });

    if (!isSuccess) {
      return {
        isSuccess,
        message,
        data: [],
      };
    }

    // Execute the query to find data in the database
    try {
      const response: any = await query({
        query: queryString,
        values: values,
      });

      if (response.length === 0) {
        return {
          isSuccess: true,
          message: "No data found.",
          data: [],
        };
      }

      return {
        isSuccess: true,
        message: "Data fetched successfully.",
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
  }
}

type handlePostUserMenuPermissionsProps = {
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
      }
    | {
        user_id: number;
        brand_id: number;
      };
};

const handlePostUserPermissions = async (
  params: handlePostUserMenuPermissionsProps
) => {
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

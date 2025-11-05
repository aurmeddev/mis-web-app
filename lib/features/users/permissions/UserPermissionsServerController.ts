import { ApiResponseProps, query } from "@/database/query";
import {
  PostUserMenuPermissionsProps,
  PostUserBrandPermissionsProps,
  PostApProfileBrandPermissionsProps,
  VerifyPermissionsProps,
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
    const databaseTableName = "v_UserAccessMenus";
    for (const id of user_id) {
      for (const main of main_menu) {
        const mainMenuPayload = {
          user_id: Number(id),
          main_menu_id: main.main_menu_id,
        };
        const validationResponse = await this.handleVerifyPermissions({
          searchKeyword: "validation",
          payload: mainMenuPayload,
          databaseTableName: databaseTableName,
          staticSearchField: "user_id",
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
          const mainMenuAccessResponse = await this.handlePostPermissions({
            databaseTableName: "User_Access_Main_Menus",
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
            const validationResponse = await this.handleVerifyPermissions({
              searchKeyword: "validation",
              payload: subMenuPayload,
              databaseTableName: databaseTableName,
              staticSearchField: "user_id",
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
              const subMenuAccessResponse = await this.handlePostPermissions({
                databaseTableName: "User_Access_Sub_Menus",
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
    const databaseTableName = "User_Access_Brands";
    for (const id of user_id) {
      for (const brandId of brand_id) {
        const permissionsPayload = {
          user_id: Number(id),
          brand_id: brandId,
        };
        const validationResponse = await this.handleVerifyPermissions({
          searchKeyword: "validation",
          payload: permissionsPayload,
          databaseTableName: databaseTableName,
          staticSearchField: "user_id",
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
          const permissionsResponse = await this.handlePostPermissions({
            databaseTableName: databaseTableName,
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

  async postApProfileBrandPermissions(
    params: PostApProfileBrandPermissionsProps
  ) {
    const { ap_profile_id, brand_id } = params;
    const result: any[] = [];
    const databaseTableName = "Ap_Profiles_Access";
    for (const id of ap_profile_id) {
      for (const brandId of brand_id) {
        const permissionsPayload = {
          ap_profile_id: Number(id),
          brand_id: brandId,
        };
        const validationResponse = await this.handleVerifyPermissions({
          searchKeyword: "validation",
          payload: permissionsPayload,
          databaseTableName: databaseTableName,
          staticSearchField: "ap_profile_id",
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
              "Unable to proceed. The profile already has access to the brand.",
          });
        } else {
          const permissionsResponse = await this.handlePostPermissions({
            databaseTableName: "Ap_Profiles_Access",
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

    console.log("Add AP Profile Brand Permissions:");
    console.log(result);
    return {
      isSuccess: true,
      message: "Data have been submitted successfully.",
      data: [],
    };
  }

  private async handleVerifyPermissions(params: VerifyPermissionsProps) {
    const { searchKeyword, payload, databaseTableName, staticSearchField } =
      params;
    const customSearchParams = new URLSearchParams();
    customSearchParams.set("method", "find-one");
    customSearchParams.set("condition", "all");
    let validPayload = {};
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
      requestUrlSearchParams: customSearchParams,
      dynamicSearchPayload: validPayload,
      databaseTableName,
      staticSearchField,
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

  private async handlePostPermissions(params: HandlePermissionsProps) {
    const { databaseTableName, payload } = params;
    const mysql = new MySqlUtils();
    const { columns, values, questionMarksValue } =
      mysql.generateInsertQuery(payload);
    const queryString = `INSERT INTO ${databaseTableName} ${columns} ${questionMarksValue}`;
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
  }

  // private async handleUpdatePermissions(params: any) {
  //   const { databaseTableName, payload } = params;
  //   const mysql = new MySqlUtils();
  //   const { columns, values, whereClause } = mysql.generateUpdateQuery(params);
  //   const queryString = `UPDATE ${databaseTableName} ${columns} ${whereClause}`;
  //   console.log(queryString);
  //   console.log(values);

  //   // Execute the query to update data into the database
  //   try {
  //     await query({
  //       query: queryString,
  //       values: values,
  //     });

  //     return {
  //       isSuccess: true,
  //       message: "Updated successfully.",
  //       data: [],
  //     };
  //   } catch (error: any) {
  //     console.error(error);
  //     return {
  //       isSuccess: false,
  //       message: "Something went wrong! Please reload the page and try again.",
  //       data: [],
  //     };
  //   }
  // }
}

type IdProps = { id?: number };

type MainMenuProps = IdProps & {
  user_id: number;
  main_menu_id: number;
};

type SubMenuProps = MainMenuProps & {
  sub_menu_id: number;
};

type BrandProps = Pick<MainMenuProps, "user_id" | "id"> & {
  brand_id: number;
};

type ApProfileProps = Pick<BrandProps, "brand_id"> &
  IdProps & {
    ap_profile_id: number;
  };

type HandlePermissionsProps = {
  databaseTableName: string;
  payload: MainMenuProps | SubMenuProps | BrandProps | ApProfileProps;
};

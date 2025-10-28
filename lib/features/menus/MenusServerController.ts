import { ApiResponseProps, query } from "@/database/query";

export class MenusServerController {
  async getAllMainMenus(): Promise<ApiResponseProps> {
    const queryString = `SELECT * FROM Main_Menus`;
    try {
      const response: any = await query({
        query: queryString,
        values: [],
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

  async getAllSubMenus(): Promise<ApiResponseProps> {
    const queryString = `SELECT * FROM Sub_Menus`;
    try {
      const response: any = await query({
        query: queryString,
        values: [],
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

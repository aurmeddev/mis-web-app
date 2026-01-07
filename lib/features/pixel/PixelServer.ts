import { ApiResponseProps, query } from "@/database/query";
import {
  IPixel,
  IPixelFindServer,
  IPixelFindServerModule,
  IPixelPost,
  IPixelUpdate,
} from "./IPixel";
import { MySqlUtils } from "@/lib/utils/mysql/MySqlUtils";
import { SearchKeywordService } from "../search-keyword/SearchKeywordService";
import { CMSV2Database } from "@/database/CMSV2Database";
import { MySQLDatabase } from "@/database/MySQLDatabase";

export class PixelServer implements IPixel, IPixelFindServerModule {
  async post(params: IPixelPost): Promise<ApiResponseProps> {
    const db = this.database();
    const mysqlUtils = new MySqlUtils();
    const { columns, values, questionMarksValue } =
      mysqlUtils.generateInsertQuery(params);
    const queryString = `INSERT INTO Pixel ${columns} ${questionMarksValue}`;
    console.log(queryString);
    console.log(values);

    try {
      await db.query({
        query: queryString,
        values: values,
      });

      return {
        isSuccess: true,
        message: "Pixel has been saved successfully.",
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

  async find(params: IPixelFindServer): Promise<ApiResponseProps> {
    const db = this.database();
    const { searchKeyword, payload, requestUrlSearchParams } = params;
    const searchApi = new SearchKeywordService();
    const { queryString, values, isSuccess, message } = searchApi.search({
      searchKeyword,
      requestUrlSearchParams: requestUrlSearchParams,
      dynamicSearchPayload: payload,
      databaseTableName: "Pixel",
      staticSearchField: "pixel",
    });

    if (!isSuccess) {
      return {
        isSuccess,
        message,
        data: [],
      };
    }
    try {
      const response: any = await db.query({
        query: queryString,
        values: values,
      });

      if (response.length === 0) {
        return {
          isSuccess: true,
          message: "Pixel not found.",
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

  async update(params: IPixelUpdate): Promise<ApiResponseProps> {
    const db = this.database();
    const mysqlUtils = new MySqlUtils();
    const { columns, values, whereClause } =
      mysqlUtils.generateUpdateQuery(params);
    const queryString = `UPDATE Pixel ${columns} ${whereClause}`;
    console.log(queryString);
    console.log(values);

    try {
      await db.query({
        query: queryString,
        values: values,
      });

      return {
        isSuccess: true,
        message: "Pixel has been updated successfully.",
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

  database = () => {
    return new MySQLDatabase(new CMSV2Database().getConnection());
  };
}

import { ApiResponseProps } from "@/database/query";
import {
  IExportPostbackLogs,
  IPostbackLogs,
  IUpdatePostbackLogStatus,
} from "./IPostbackLogs";
import { MySQLDatabase } from "@/database/MySQLDatabase";
import { CMSV2Database } from "@/database/CMSV2Database";
import { DatetimeUtils } from "@/lib/utils/date/DatetimeUtils";

export class ServerPostbackLogs
  implements IPostbackLogs, IUpdatePostbackLogStatus
{
  async export(params: IExportPostbackLogs): Promise<ApiResponseProps> {
    const db = new MySQLDatabase(new CMSV2Database().getConnection());
    const { date_from, date_to } = params;
    const queryString = `SELECT voluum_campaignid, pixel, remarks, description, createdAt FROM v_Log WHERE createdAt BETWEEN ? AND ? AND isFixed=1 AND (log_id = 3 OR log_id = 5)`;
    const queryValues = [date_from, date_to];

    try {
      const response: any = await db.query({
        query: queryString,
        values: queryValues,
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
        data: this.formatResponse(response),
        message: "Postback logs exported successfully",
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

  async findByPixel(params: { pixel: string }): Promise<ApiResponseProps> {
    const db = new MySQLDatabase(new CMSV2Database().getConnection());
    const { pixel } = params;
    const queryString = `SELECT id, voluum_campaignid, pixel, remarks, description, createdAt FROM v_Log WHERE pixel=? AND isFixed=1 AND (log_id = 3 OR log_id = 5)`;
    const queryValues = [pixel];

    try {
      const response: any = await db.query({
        query: queryString,
        values: queryValues,
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
        data: this.formatResponse(response),
        message: `${pixel} postback logs exported successfully`,
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

  async updatePostbackLogStatus(params: {
    pixel: string;
  }): Promise<ApiResponseProps> {
    const db = new MySQLDatabase(new CMSV2Database().getConnection());
    const { pixel } = params;
    const queryString = `UPDATE Log SET isFixed=0 WHERE pixel=? AND isFixed=1`; // isFixed  = 0 (fixed)
    const queryValues = [pixel];

    try {
      await db.query({
        query: queryString,
        values: queryValues,
      });

      return {
        isSuccess: true,
        data: [],
        message: `Log status updated successfully`,
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
  formatResponse = (response: any) => {
    const dateUtils = new DatetimeUtils();
    return response.map((item: any) => ({
      ...item,
      createdAt: dateUtils.formatDateTime(item.createdAt),
    }));
  };
}

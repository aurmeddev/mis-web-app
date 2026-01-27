import { ApiResponseProps, query } from "@/database/query";
import { IPostbackLogs, IExportPostbackLogs } from "./IPostbackLogs";
import { MySQLDatabase } from "@/database/MySQLDatabase";
import { CMSV2Database } from "@/database/CMSV2Database";
import { DatetimeUtils } from "@/lib/utils/date/DatetimeUtils";

export class ExportServerPostbackLogs implements IExportPostbackLogs {
  async export(params: IPostbackLogs): Promise<ApiResponseProps> {
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

      const dateUtils = new DatetimeUtils();
      const formattedResponse = response.map((item: any) => ({
        ...item,
        createdAt: dateUtils.formatDateTime(item.createdAt),
      }));

      return {
        isSuccess: true,
        data: formattedResponse,
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
}

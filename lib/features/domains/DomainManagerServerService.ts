import {
  FindDomainManagerServiceProps,
  PostDomainManagerServiceProps,
} from "./type/DomainManagerServiceProps";
import { ApiResponseProps, query } from "@/database/dbConnection";
import { MySqlUtils } from "@/lib/utils/mysql/MySqlUtils";
import { DatetimeUtils } from "@/lib/utils/date/DatetimeUtils";
import { getServerCurrentDatetime } from "@/app/api/ap-profiles/post/route";
import { SearchKeywordService } from "../search-keyword/SearchKeywordService";

type FindDomainManagerServerServiceProps = Omit<
  FindDomainManagerServiceProps,
  "method" | "condition" | "dynamicSearchPayload"
> & {
  payload: object;
  requestUrlSearchParams: any;
};
export class DomainManagerServerService {
  async post(
    params: PostDomainManagerServiceProps & {
      user: {
        id: number;
        full_name: string;
        team_name: string;
      };
    }
  ): Promise<ApiResponseProps> {
    const { user, domain_name } = params;
    if (!domain_name) {
      return {
        isSuccess: false,
        message: "The domain name is missing.",
        data: [],
      };
    }
    const mysqlUtils = new MySqlUtils();
    const { columns, values, questionMarksValue } =
      mysqlUtils.generateInsertQuery({ created_by: user.id, domain_name });
    const queryString = `INSERT INTO Domains ${columns} ${questionMarksValue}`;
    console.log(queryString);
    console.log(values);

    try {
      const response: any = await query({
        query: queryString,
        values: values,
      });

      const dateUtils = new DatetimeUtils();
      const { insertId } = response;

      const result: any = {
        id: insertId,
        status: "active",
        created_by: {
          full_name: user.full_name,
          team_name: user.team_name,
        },
        created_at: dateUtils.formatDateTime(
          dateUtils.convertToUTC8(await getServerCurrentDatetime())
        ),
      };

      return {
        isSuccess: true,
        message: "Domain have been saved successfully.",
        data: [result],
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

  async find(params: FindDomainManagerServerServiceProps) {
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
      databaseTableName: "v_Domains",
      staticSearchField: "domain_name",
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

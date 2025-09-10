import { PostDomainManagerServiceProps } from "./type/DomainManagerServiceProps";
import { ApiResponseProps, query } from "@/database/dbConnection";
import { MySqlUtils } from "@/lib/utils/mysql/MySqlUtils";
import { DatetimeUtils } from "@/lib/utils/date/DatetimeUtils";
import { getServerCurrentDatetime } from "@/app/api/ap-profiles/post/route";

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
}

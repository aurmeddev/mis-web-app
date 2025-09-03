import { ApiResponseProps, query } from "@/database/dbConnection";
import { GetAllManageUsersProps } from "./type/ManageUsersProps";
import { MySqlUtils } from "@/lib/utils/mysql/MySqlUtils";
import { ObjectUtils } from "@/lib/utils/object/ObjectUtils";
import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";

export class ManageUsersServerService {
  async getAllUsers(
    params: GetAllManageUsersProps
  ): Promise<ApiResponseProps & { pagination?: PaginationProps }> {
    const dbFieldColumns: {
      user_type_id?: number;
      team_id?: number;
      status?: "active" | "inactive";
    } = {};

    if (params.user_type) {
      dbFieldColumns.user_type_id = params.user_type;
    }
    if (params.team) {
      dbFieldColumns.team_id = params.team;
    }
    if (params.status) {
      const statusValue = params.status.toLowerCase();
      if (statusValue !== "active" && statusValue !== "inactive") {
        return {
          isSuccess: false,
          message: "Invalid status value. It must be active or inactive",
          data: [],
        };
      }
      dbFieldColumns.status = statusValue;
    }

    const mysqlUtils = new MySqlUtils();
    const objUtils = new ObjectUtils();
    const { page, limit, offset } = mysqlUtils.generatePaginationQuery({
      page: params.page,
      limit: params.limit,
    });
    const paginationValues = {
      limit,
      offset,
    };

    const paginationQuery = mysqlUtils.generateSelectQuery({
      data: paginationValues,
    });
    const filterQuery = mysqlUtils.generateSelectQuery({
      data: dbFieldColumns,
    });

    const conditionQuery = `${
      objUtils.isValidObject(dbFieldColumns)
        ? filterQuery.queryWhereClauseString
        : ""
    }`;

    const queryString = `SELECT * FROM v_UserAccess ${conditionQuery} LIMIT ? OFFSET ?`;
    let queryValues: string[] = paginationQuery.queryValues;
    const hasFilter = filterQuery?.queryValues?.length > 0;
    if (hasFilter) {
      queryValues = [
        ...filterQuery.queryValues,
        ...paginationQuery.queryValues,
      ];
    }

    console.log(queryString);
    console.log(queryValues);
    // Execute the query to get all AP profiles by pagination
    try {
      const response: any = await query({
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

      // Get the total count of rows for pagination
      const rows: any = await query({
        query: `SELECT COUNT(*) AS total_count FROM v_UserAccess ${conditionQuery}`,
        values: hasFilter ? filterQuery.queryValues : [],
      });
      const totalRows: number = rows[0].total_count;
      const totalPages: number = Math.ceil(totalRows / limit);

      const rowIds = mysqlUtils.generateRowIds({
        page: page,
        limit: limit,
        size: response.length,
      });

      const formattedResponse = await Promise.all(
        response.map(async (item: any, index: number) => {
          const { ...rest } = item;

          return {
            ...rest,
            row_id: rowIds[index],
          };
        })
      );

      return {
        isSuccess: true,
        message: "Data fetched successfully.",
        pagination: { page, limit, total_pages: totalPages },
        data: formattedResponse,
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

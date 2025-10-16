import { ApiResponseProps, query } from "@/database/query";
import { GetAllManageUsersProps } from "./type/ManageUsersProps";
import { MySqlUtils } from "@/lib/utils/mysql/MySqlUtils";
import { ObjectUtils } from "@/lib/utils/object/ObjectUtils";
import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";

export class UsersManageServerService {
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

    const hasPagination =
      typeof params.page === "number" &&
      params.page > 0 &&
      typeof params.limit === "number" &&
      params.limit > 0;

    const pagination: {
      generatedPaginationQueryResult: {
        page: number;
        limit: number;
        offset: number;
      };
      queryValues: string[];
    } = {
      generatedPaginationQueryResult: { page: 0, limit: 0, offset: 0 },
      queryValues: [],
    };

    if (hasPagination) {
      const { page, limit, offset } = mysqlUtils.generatePaginationQuery({
        page: params.page,
        limit: params.limit,
      });
      pagination.generatedPaginationQueryResult = { page, limit, offset };
      const result = mysqlUtils.generateSelectQuery({
        data: { limit, offset },
      });
      pagination.queryValues = result.queryValues;
    }

    const filterQuery = mysqlUtils.generateSelectQuery({
      data: dbFieldColumns,
    });

    const conditionQuery = `${
      objUtils.isValidObject(dbFieldColumns)
        ? filterQuery.queryWhereClauseString
        : ""
    }`;

    const paginationQueryString = `${hasPagination ? " LIMIT ? OFFSET ?" : ""}`;
    const queryString = `SELECT * FROM v_UserAccessV2 ${conditionQuery} ${paginationQueryString}`;

    let queryValues: string[] = [];
    const hasFilter = filterQuery?.queryValues?.length > 0;
    if (hasFilter) {
      queryValues = queryValues.concat([...filterQuery.queryValues]);
    }
    if (hasPagination) {
      queryValues = queryValues.concat([...pagination.queryValues]);
    }

    console.log(queryString);
    console.log(queryValues);

    // Execute the query to get all users
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

      const page = pagination.generatedPaginationQueryResult.page;
      const limit = pagination.generatedPaginationQueryResult.limit;
      let totalPages: number = 0;
      const result: ApiResponseProps & { pagination?: PaginationProps } = {
        isSuccess: true,
        message: "Data fetched successfully.",
        data: response,
      };

      if (hasPagination) {
        // Get the total count of rows for pagination
        const rows: any = await query({
          query: `SELECT COUNT(*) AS total_count FROM v_UserAccessV2 ${conditionQuery}`,
          values: hasFilter ? filterQuery.queryValues : [],
        });

        const totalRows: number = rows[0].total_count;
        totalPages = Math.ceil(totalRows / limit);

        const rowIds = mysqlUtils.generateRowIds({
          page: page,
          limit: limit,
          size: response.length,
        });

        result.data = await Promise.all(
          response.map(async (item: any, index: number) => {
            const { ...rest } = item;

            return {
              ...rest,
              row_id: rowIds[index],
            };
          })
        );

        result.pagination = { page, limit, total_pages: totalPages };
      }

      return result;
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

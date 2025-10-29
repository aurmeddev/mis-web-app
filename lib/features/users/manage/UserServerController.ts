import { ApiResponseProps, query } from "@/database/query";
import {
  FindUserProps,
  GetAllUserProps,
  PostUserProps,
  ToggleStatusUserProps,
  UpdateUserProps,
} from "./type/UserProps";
import { MySqlUtils } from "@/lib/utils/mysql/MySqlUtils";
import { ObjectUtils } from "@/lib/utils/object/ObjectUtils";
import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";
import { getServerCurrentDatetime } from "@/app/api/ap-profiles/post/route";
import { DatetimeUtils } from "@/lib/utils/date/DatetimeUtils";
import { SearchKeywordService } from "../../search-keyword/SearchKeywordService";
import { CryptoServerService } from "../../security/cryptography/CryptoServerService";

export class UserServerController {
  async getAllUsers(
    params: GetAllUserProps
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

        const cipher = new CryptoServerService();
        result.data = await Promise.all(
          response.map(async (item: any, index: number) => {
            const { id, ...rest } = item;
            // Encrypt the user ID
            const { isSuccess, encryptedData, message } = await cipher.encrypt({
              data: String(id),
            });
            return {
              id: isSuccess ? encryptedData : message,
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

  async getDistinctRecruiters(): Promise<ApiResponseProps> {
    const queryString = `SELECT * FROM v_Recruiters`;
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

  async post(params: PostUserProps): Promise<ApiResponseProps> {
    const mysqlUtils = new MySqlUtils();
    const { columns, values, questionMarksValue } =
      mysqlUtils.generateInsertQuery(params);
    const queryString = `INSERT INTO Users ${columns} ${questionMarksValue}`;
    console.log(queryString);
    console.log(values);

    try {
      const response: any = await query({
        query: queryString,
        values: values,
      });

      const dateUtils = new DatetimeUtils();
      const cipher = new CryptoServerService();
      const { insertId } = response;
      // Encrypt the user ID
      const { isSuccess, encryptedData, message } = await cipher.encrypt({
        data: String(insertId),
      });

      if (!isSuccess) {
        return {
          isSuccess,
          message,
          data: [],
        };
      }

      const result: any = {
        id: encryptedData,
        status: "active",
        created_at: dateUtils.formatDateTime(
          dateUtils.convertToUTC8(await getServerCurrentDatetime())
        ),
      };

      return {
        isSuccess: true,
        message: "User has been saved successfully.",
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

  async find(
    params: Omit<
      FindUserProps,
      "method" | "condition" | "dynamicSearchPayload"
    > & {
      payload: object;
      requestUrlSearchParams: any;
    }
  ) {
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
      databaseTableName: "v_UserAccessV2",
      staticSearchField: "full_name",
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

      const cipher = new CryptoServerService();
      const result = await Promise.all(
        response.map(async (item: any) => {
          const { id, ...rest } = item;
          // Encrypt the user ID
          const { isSuccess, encryptedData, message } = await cipher.encrypt({
            data: String(id),
          });
          return {
            id: isSuccess ? encryptedData : message,
            ...rest,
          };
        })
      );

      return {
        isSuccess: true,
        message: "Data fetched successfully.",
        data: result,
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

  async toggleStatus(params: ToggleStatusUserProps): Promise<ApiResponseProps> {
    const { id, is_active } = params;
    if (is_active >= 2) {
      return {
        isSuccess: false,
        message: "Incorrect active value.",
        data: [],
      };
    }
    const mysqlUtils = new MySqlUtils();
    const { columns, values, whereClause } = mysqlUtils.generateUpdateQuery({
      is_active: is_active,
      id: id,
    });
    const queryString = `UPDATE Users ${columns} ${whereClause}`;
    console.log(queryString);
    console.log(values);
    try {
      await query({
        query: queryString,
        values: values,
      });

      return {
        isSuccess: true,
        message: `The user has been ${
          is_active ? "activated" : "deactivated"
        } successfully.`,
        data: [
          {
            status: is_active ? "active" : "inactive",
          },
        ],
      };
    } catch (error: any) {
      console.error(error);
      return {
        isSuccess: false,
        message: "Something went wrong! Please reload the page and try again.",
        data: [],
      };
    }
  }

  async update(params: UpdateUserProps): Promise<ApiResponseProps> {
    const { id, ...rest } = params;
    const mysqlUtils = new MySqlUtils();
    const { columns, values, whereClause } =
      mysqlUtils.generateUpdateQuery(params);
    const queryString = `UPDATE Users ${columns} ${whereClause}`;
    console.log(queryString);
    console.log(values);
    try {
      await query({
        query: queryString,
        values: values,
      });

      return {
        isSuccess: true,
        message: "User has been updated successfully.",
        data: [rest],
      };
    } catch (error: any) {
      console.error(error);
      return {
        isSuccess: false,
        message: "Something went wrong! Please reload the page and try again.",
        data: [],
      };
    }
  }

  async verifyEmail(email: string): Promise<ApiResponseProps> {
    // Validate if the email already taken
    const customSearchParams = new URLSearchParams();
    customSearchParams.set("method", "find-one");
    const validationResponse = await this.find({
      searchKeyword: "validation",
      requestUrlSearchParams: customSearchParams,
      payload: { email: email },
    });

    if (!validationResponse.isSuccess) {
      return {
        isSuccess: false,
        message: "Validation error occurred.",
        data: [{ code: 500 }],
      };
    }
    const isTaken = validationResponse.data.length > 0;
    if (isTaken) {
      return {
        isSuccess: false,
        message: `The email is already taken. Please choose a different one.`,
        data: [{ code: 409 }],
      };
    }

    return {
      isSuccess: true,
      message: `The email is available.`,
      data: [],
    };
  }

  async getUserTypes(): Promise<ApiResponseProps> {
    const queryString = `SELECT * FROM User_Types`;
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

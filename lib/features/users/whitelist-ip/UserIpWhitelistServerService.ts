import { DatetimeUtils } from "../../../utils/date/DatetimeUtils";
import { MySqlUtils } from "@/lib/utils/mysql/MySqlUtils";
import {
  FindUserIpWhitelistParams,
  PaginationUserIpWhitelistProps,
  PostUserIpWhitelistParams,
  UpdateUserIpWhitelistInfoParams,
  UpdateUserIpWhitelistStatusParams,
} from "./type/UserIpWhitelistProps";
import { ApiResponseProps, query } from "@/database/dbConnection";
import { IpAddressUtil } from "./util/IpAddressUtil";
import { PaginationProps } from "../../../utils/pagination/type/PaginationProps";
export class UserIpWhitelistServerService {
  async post(params: PostUserIpWhitelistParams): Promise<ApiResponseProps> {
    const mysqlUtils = new MySqlUtils();
    const { columns, values, questionMarksValue } =
      mysqlUtils.generateInsertQuery(params);

    const queryString = `INSERT INTO User_IP_Whitelist ${columns} ${questionMarksValue}`;
    console.log(queryString);
    console.log(values);
    try {
      const response: any = await query({
        query: queryString,
        values: values,
      });

      return {
        isSuccess: true,
        message: "IP address has been whitelisted successfully.",
        data: response,
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

  async setActive(
    params: UpdateUserIpWhitelistStatusParams
  ): Promise<ApiResponseProps> {
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
    const queryString = `UPDATE User_IP_Whitelist ${columns} ${whereClause}`;
    console.log(queryString);
    console.log(values);
    try {
      const response: any = await query({
        query: queryString,
        values: values,
      });

      return {
        isSuccess: true,
        message: `IP address has been ${
          is_active ? "whitelisted" : "blocked"
        } successfully.`,
        data: response,
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

  async update(
    params: UpdateUserIpWhitelistInfoParams
  ): Promise<ApiResponseProps> {
    const mysqlUtils = new MySqlUtils();
    const { columns, values, whereClause } =
      mysqlUtils.generateUpdateQuery(params);
    console.log("params ", params);
    const queryString = `UPDATE User_IP_Whitelist ${columns} ${whereClause}`;
    console.log(queryString);
    console.log(values);
    try {
      const response: any = await query({
        query: queryString,
        values: values,
      });

      return {
        isSuccess: true,
        message: `Updated successfully.`,
        data: response,
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

  async find(params: FindUserIpWhitelistParams): Promise<ApiResponseProps> {
    const { searchKey } = params;
    const ipUtil = new IpAddressUtil();

    const ipVersion = ipUtil.checkIPVersion(searchKey);
    let prop = {};
    if (ipVersion === "Invalid") {
      if (searchKey.includes(".") || searchKey.includes(":")) {
        prop = { ip_address: searchKey };
      } else {
        prop = { name: searchKey };
      }
    } else {
      prop = { ip_address: searchKey };
    }

    const mysqlUtils = new MySqlUtils();
    const { columns, values } = mysqlUtils.generateFindQuery({
      column: prop,
      operator: "equals",
    });
    const queryString = `SELECT * FROM User_IP_Whitelist WHERE ${columns} LIMIT 3`;
    console.log(queryString);
    console.log(values);
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

      const dateUtils = new DatetimeUtils();
      type findResponseProps = {
        id: number;
        ip_address: string;
        name: string;
        created_by: number;
        is_active: number;
        created_at: Date;
      };
      const formattedResponse = response.map((item: findResponseProps) => {
        const { created_at, ...rest } = item;
        return {
          ...rest,
          created_at: dateUtils.formatDateTime(
            dateUtils.convertToUTC8(created_at)
          ),
        };
      });

      return {
        isSuccess: true,
        message: "Data fetched successfully.",
        data: formattedResponse,
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

  async get(params: PaginationUserIpWhitelistProps): Promise<
    ApiResponseProps & {
      pagination?: PaginationProps;
    }
  > {
    const util = new MySqlUtils();
    const { page, limit, offset } = util.generatePaginationQuery(params);

    const queryString = `CALL sp_getWhitelistedIps(?, ?);`;
    try {
      const response: any = await query({
        query: queryString,
        values: [String(limit), String(offset)],
      });

      if (response.length === 0) {
        return {
          isSuccess: true,
          message: "No data found!",
          data: [],
        };
      }

      let pagination: PaginationProps = {
        page: 0,
        limit: 0,
        total_pages: 0,
      };
      const rowIds = util.generateRowIds({
        page: page,
        limit: limit,
        size: response[0].length,
      });
      const dateUtils = new DatetimeUtils();
      type getResponseProps = {
        id: number;
        ip_address: string;
        name: string;
        created_at: Date;
        created_by: number;
        is_active: number;
        total_count: number;
        total_pages: number;
      };
      const formattedResponse = response[0].map(
        (item: getResponseProps, index: number) => {
          const { total_count, total_pages, ...rest } = item;
          if (index === 0) {
            pagination = {
              page: page,
              limit: limit,
              total_pages: total_pages,
            };
          }
          return {
            ...rest,
            row_id: rowIds[index],
            created_at: dateUtils.formatDateTime(
              dateUtils.convertToUTC8(rest.created_at)
            ),
          };
        }
      );
      return {
        isSuccess: true,
        pagination: pagination,
        data: formattedResponse,
        message: "Data have been retrieved successfully.",
      };
    } catch (error) {
      console.error(error);
      return {
        isSuccess: false,
        message: "Something went wrong! Please try again.",
        data: [],
      };
    }
  }
}

import { query } from "@/database/query";
import { GetAllFbAccountsProps } from "@/lib/features/fb-accounts/type/FbAccountsProps";
import { GetAllUsersLogsProps } from "@/lib/features/users/logs/type/UsersLogsProps";
import { DatetimeUtils } from "@/lib/utils/date/DatetimeUtils";
import { MySqlUtils } from "@/lib/utils/mysql/MySqlUtils";
import { ObjectUtils } from "@/lib/utils/object/ObjectUtils";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
import { NextResponse, NextRequest } from "next/server";
export const GET = async (request: NextRequest) => {
  const params: GetAllUsersLogsProps = new SearchParamsManager().toObject(
    request.nextUrl.searchParams
  );

  const mysqlUtils = new MySqlUtils();
  const objUtils = new ObjectUtils();
  const dataUtils = new DatetimeUtils();
  const { page, limit, offset } = mysqlUtils.generatePaginationQuery({
    page: params.page,
    limit:
      typeof params.limit === "number" && params.limit > 50 ? 50 : params.limit,
  });

  const dbFieldColumns: Omit<GetAllUsersLogsProps, "page" | "limit"> = {
    date_from: "",
    date_to: "",
  };
  if (!params.date_from || !params.date_to) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Date range is missing.",
        data: [],
      },
      { status: 400 }
    );
  }
  if (params.date_from) {
    if (!dataUtils.isValidYMDFormat(params.date_from)) {
      return NextResponse.json(
        {
          isSuccess: false,
          message: "Invalid date from value. It must be yyyy-MM-dd.",
          data: [],
        },
        { status: 400 }
      );
    }
    dbFieldColumns.date_from = params.date_from;
  }
  if (params.date_to) {
    if (!dataUtils.isValidYMDFormat(params.date_from)) {
      return NextResponse.json(
        {
          isSuccess: false,
          message: "Invalid date to value. It must be yyyy-MM-dd.",
          data: [],
        },
        { status: 400 }
      );
    }
    dbFieldColumns.date_to = params.date_to;
  }

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

  const queryString = `SELECT * FROM v_FbAccountsV2 ${conditionQuery} LIMIT ? OFFSET ?`;

  let queryValues: string[] = paginationQuery.queryValues;
  const hasFilter = filterQuery?.queryValues?.length > 0;
  if (hasFilter) {
    queryValues = [...filterQuery.queryValues, ...paginationQuery.queryValues];
  }

  console.log(queryString);
  console.log(queryValues);

  return NextResponse.json(
    {
      isSuccess: true,
      message: "Success",
      data: [],
    },
    { status: 200 }
  );
  // Execute the query to get all AP profiles by pagination
  // try {
  //   const response: any = await query({
  //     query: queryString,
  //     values: queryValues,
  //   });

  //   if (response.length === 0) {
  //     return NextResponse.json(
  //       {
  //         isSuccess: true,
  //         message: "No data found.",
  //         data: [],
  //       },
  //       { status: 200 }
  //     );
  //   }

  //   // Get the total count of rows for pagination
  //   const rows: any = await query({
  //     query: `SELECT COUNT(*) AS total_count FROM v_FbAccountsV2 ${conditionQuery}`,
  //     values: hasFilter ? filterQuery.queryValues : [],
  //   });
  //   const totalRows: number = rows[0].total_count;
  //   const totalPages: number = Math.ceil(totalRows / limit);

  //   const dateUtils = new DatetimeUtils();
  //   const rowIds = mysqlUtils.generateRowIds({
  //     page: page,
  //     limit: limit,
  //     size: response.length,
  //   });

  //   const formattedResponse = response.map((item: any, index: number) => {
  //     const { created_at, ...rest } = item;

  //     return {
  //       ...rest,
  //       row_id: rowIds[index],
  //       created_at: dateUtils.formatDateTime(
  //         dateUtils.convertToUTC8(created_at)
  //       ),
  //     };
  //   });

  //   return NextResponse.json(
  //     {
  //       isSuccess: true,
  //       message: "Data fetched successfully.",
  //       pagination: { page, limit, total_pages: totalPages },
  //       data: formattedResponse,
  //     },
  //     { status: 200 }
  //   );
  // } catch (error: any) {
  //   console.error(error);
  //   return NextResponse.json(
  //     {
  //       isSuccess: false,
  //       message: "Something went wrong! Please try again.",
  //       data: [],
  //     },
  //     { status: 500 }
  //   );
  // }
};

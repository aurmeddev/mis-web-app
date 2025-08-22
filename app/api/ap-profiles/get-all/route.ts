import { query } from "@/database/dbConnection";
import { GetAllApProfilesProps } from "@/lib/features/ap-profiles/type/ApProfilesProps";
import { DatetimeUtils } from "@/lib/utils/date/DatetimeUtils";
import { MySqlUtils } from "@/lib/utils/mysql/MySqlUtils";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
import { NextResponse, NextRequest } from "next/server";
export const GET = async (request: NextRequest) => {
  const params: GetAllApProfilesProps = new SearchParamsManager().toObject(
    request.nextUrl.searchParams
  );

  const mysqlUtils = new MySqlUtils();
  const { page, limit, offset } = mysqlUtils.generatePaginationQuery({
    page: params.page,
    limit: params.limit,
  });
  const { queryValues } = mysqlUtils.generateSelectQuery({
    data: { limit, offset },
  });
  const queryString = `SELECT * FROM v_Ap_Profiles LIMIT ? OFFSET ?`;
  console.log(queryString);
  console.log(queryValues);

  // Execute the query to get all AP profiles by pagination
  try {
    const response: any = await query({
      query: queryString,
      values: queryValues,
    });

    if (response.length === 0) {
      return NextResponse.json(
        {
          isSuccess: true,
          message: "No data found.",
          data: [],
        },
        { status: 200 }
      );
    }

    // Get the total count of rows for pagination
    const rows: any = await query({
      query: "SELECT COUNT(*) AS total_count FROM v_Ap_Profiles",
      values: [],
    });
    const totalRows: number = rows[0].total_count;
    const totalPages: number = Math.ceil(totalRows / limit);

    const dateUtils = new DatetimeUtils();
    const rowIds = mysqlUtils.generateRowIds({
      page: page,
      limit: limit,
      size: response.length,
    });
    const formattedResponse = response.map((item: any, index: number) => {
      const { created_at, ...rest } = item;
      return {
        ...rest,
        row_id: rowIds[index],
        created_at: dateUtils.formatDateTime(
          dateUtils.convertToUTC8(created_at)
        ),
      };
    });

    return NextResponse.json(
      {
        isSuccess: true,
        message: "Data fetched successfully.",
        pagination: { page, limit, total_pages: totalPages },
        data: formattedResponse,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Something went wrong! Please try again.",
        data: [],
      },
      { status: 500 }
    );
  }
};

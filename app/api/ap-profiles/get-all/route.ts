import { query } from "@/database/dbConnection";
import { GetAllApProfilesProps } from "@/lib/features/ap-profiles/type/ApProfilesProps";
import { CryptoServerService } from "@/lib/features/security/cryptography/CryptoServerService";
import { DatetimeUtils } from "@/lib/utils/date/DatetimeUtils";
import { MySqlUtils } from "@/lib/utils/mysql/MySqlUtils";
import { ObjectUtils } from "@/lib/utils/object/ObjectUtils";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
import { NextResponse, NextRequest } from "next/server";
export const GET = async (request: NextRequest) => {
  const params: GetAllApProfilesProps = new SearchParamsManager().toObject(
    request.nextUrl.searchParams
  );

  const mysqlUtils = new MySqlUtils();
  const objUtils = new ObjectUtils();
  const { page, limit, offset } = mysqlUtils.generatePaginationQuery({
    page: params.page,
    limit:
      typeof params.limit === "number" && params.limit > 50 ? 50 : params.limit,
  });
  const dbFieldColumns: Omit<GetAllApProfilesProps, "page" | "limit"> = {};
  if (params.status) {
    const statusValue = params.status.toLowerCase();
    if (statusValue !== "active" && statusValue !== "available") {
      return NextResponse.json(
        {
          isSuccess: false,
          message: "Invalid status value. It must be active or available",
          data: [],
        },
        { status: 400 }
      );
    }
    dbFieldColumns.status = statusValue;
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

  const queryString = `SELECT * FROM v_ApProfiles ${conditionQuery} LIMIT ? OFFSET ?`;

  let queryValues: string[] = paginationQuery.queryValues;
  const hasFilter = filterQuery?.queryValues?.length > 0;
  if (hasFilter) {
    queryValues = [...filterQuery.queryValues, ...paginationQuery.queryValues];
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
      query: `SELECT COUNT(*) AS total_count FROM v_ApProfiles ${conditionQuery}`,
      values: hasFilter ? filterQuery.queryValues : [],
    });
    const totalRows: number = rows[0].total_count;
    const totalPages: number = Math.ceil(totalRows / limit);

    const dateUtils = new DatetimeUtils();
    const rowIds = mysqlUtils.generateRowIds({
      page: page,
      limit: limit,
      size: response.length,
    });

    const cipher = new CryptoServerService();
    const formattedResponse = await Promise.all(
      response.map(async (item: any, index: number) => {
        const { created_at, is_active, created_by, ap_created_by, ...rest } =
          item;

        if (rest.fb_account.app_2fa_key) {
          const { isSuccess, encryptedData, message } = await cipher.encrypt({
            data: rest.fb_account.app_2fa_key, // Enrypt app_2fa_key
          });
          rest.fb_account.app_2fa_key = isSuccess ? encryptedData : message;
        }

        return {
          ...rest,
          created_by: ap_created_by,
          row_id: rowIds[index],
          created_at: dateUtils.formatDateTime(
            dateUtils.convertToUTC8(created_at)
          ),
        };
      })
    );

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

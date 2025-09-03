import { query } from "@/database/dbConnection";
import { GetAllFbAccountsProps } from "@/lib/features/fb-accounts/type/FbAccountsProps";
import { CryptoServerService } from "@/lib/features/security/cryptography/CryptoServerService";
import { DatetimeUtils } from "@/lib/utils/date/DatetimeUtils";
import { MySqlUtils } from "@/lib/utils/mysql/MySqlUtils";
import { ObjectUtils } from "@/lib/utils/object/ObjectUtils";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
import { NextResponse, NextRequest } from "next/server";
export const GET = async (request: NextRequest) => {
  const params: GetAllFbAccountsProps = new SearchParamsManager().toObject(
    request.nextUrl.searchParams
  );

  const mysqlUtils = new MySqlUtils();
  const objUtils = new ObjectUtils();
  const { page, limit, offset } = mysqlUtils.generatePaginationQuery({
    page: params.page,
    limit: params.limit,
  });

  const dbFieldColumns: Omit<GetAllFbAccountsProps, "page" | "limit"> = {};
  if (params.status) {
    const lowercaseActiveValue = params.status.toLowerCase();
    if (
      lowercaseActiveValue !== "active" &&
      lowercaseActiveValue !== "available"
    ) {
      return NextResponse.json(
        {
          isSuccess: false,
          message: "Invalid status value. It must be active or available",
          data: [],
        },
        { status: 400 }
      );
    }
    dbFieldColumns.status = lowercaseActiveValue;
  }

  if (params.recruiter) {
    dbFieldColumns.recruiter = params.recruiter;
  }

  const paginationValues = {
    limit,
    offset,
  };

  const paginationQuery = mysqlUtils.generateSelectQuery({
    data: paginationValues,
  });
  const whereClauseQuery = mysqlUtils.generateSelectQuery({
    data: dbFieldColumns,
  });

  const conditionQuery = `${
    objUtils.isValidObject(dbFieldColumns)
      ? whereClauseQuery.queryWhereClauseString
      : ""
  }`;
  const queryString = `SELECT * FROM v_FbAccountsV2 ${conditionQuery} LIMIT ? OFFSET ?`;

  let queryValues: string[] = paginationQuery.queryValues;
  const hasStatusFilter = whereClauseQuery?.queryValues?.length > 0;
  if (hasStatusFilter) {
    queryValues = [
      ...whereClauseQuery.queryValues,
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
      query: `SELECT COUNT(*) AS total_count FROM v_FbAccountsV2 ${conditionQuery}`,
      values: hasStatusFilter ? whereClauseQuery.queryValues : [],
    });
    const totalRows: number = rows[0].total_count;
    const totalPages: number = Math.ceil(totalRows / limit);

    const cipher = new CryptoServerService();
    const dateUtils = new DatetimeUtils();

    const rowIds = mysqlUtils.generateRowIds({
      page: page,
      limit: limit,
      size: response.length,
    });

    const formattedResponse = await Promise.all(
      response.map(async (item: any, index: number) => {
        const {
          created_at,
          is_active, // Exclude is_active in the response.
          fb_owner_account_created,
          base_search_keyword, // Exclude base_search_keyword in the response. It's for searching purpose only
          recruiter, // Exclude recruiter in the response. It's for filtering purpose only
          ...rest
        } = item;

        if (rest.app_2fa_key) {
          const { isSuccess, encryptedData, message } = await cipher.encrypt({
            data: rest.app_2fa_key, // Enrypt app_2fa_key
          });
          rest.app_2fa_key = isSuccess ? encryptedData : message;
        }

        if (objUtils.isValidObject(rest.ap_profile)) {
          rest.ap_profile.created_at = dateUtils.formatDateTime(
            dateUtils.convertToUTC8(rest.ap_profile.created_at)
          );
        }

        return {
          ...rest,
          row_id: rowIds[index],
          fb_owner_account_created: dateUtils.formatDateOnly(
            dateUtils.convertToUTC8(fb_owner_account_created)
          ),
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

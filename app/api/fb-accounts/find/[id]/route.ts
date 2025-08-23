import { query } from "@/database/dbConnection";
import { FindFbAccountsProps } from "@/lib/features/fb-accounts/type/FbAccountsProps";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { DatetimeUtils } from "@/lib/utils/date/DatetimeUtils";
import { MySqlUtils } from "@/lib/utils/mysql/MySqlUtils";
import { ObjectUtils } from "@/lib/utils/object/ObjectUtils";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
import { NextResponse, NextRequest } from "next/server";
export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  // Check if the user session is valid before processing the request
  // const session = await getSession();
  // if (!session) {
  //   return NextResponse.json(
  //     {
  //       isSuccess: false,
  //       message: "Session expired or invalid",
  //     },
  //     { status: 403 }
  //   );
  // }

  type FindMethodProps = Omit<
    FindFbAccountsProps,
    "searchKeyword" | "dynamicSearchPayload"
  >;
  const methodParams: FindMethodProps = new SearchParamsManager().toObject(
    request.nextUrl.searchParams
  );
  const { method } = methodParams;
  const searchKeyword = `${(await params).id}`;
  const objUtil = new ObjectUtils();
  const payload: object = await request.json();
  const isValidPayload = objUtil.isValidObject(payload);

  let column = payload;
  if (!isValidPayload) {
    column = {
      base_search_keyword: searchKeyword,
    };
  }

  const mysqlUtils = new MySqlUtils();
  const { columns, values } = mysqlUtils.generateFindQuery({
    column: column,
    operator: method === "find-one" ? "equals" : "like", // Default to "like" if not provided
  });
  const queryString = `SELECT * FROM v_FbAccounts WHERE ${columns} LIMIT 3`;
  console.log(queryString);
  console.log(values);

  // Execute the query to find data in the database
  try {
    const response: any = await query({
      query: queryString,
      values: values,
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

    const dateUtils = new DatetimeUtils();
    const formattedResponse = response.map((item: any) => {
      const {
        created_at,
        is_active, // Exclude base_search_keyword in the response
        fb_owner_account_created,
        base_search_keyword, // Exclude base_search_keyword in the response
        ...rest
      } = item;
      return {
        ...rest,
        fb_owner_account_created: dateUtils.formatDateOnly(
          dateUtils.convertToUTC8(fb_owner_account_created)
        ),
        created_at: dateUtils.formatDateTime(
          dateUtils.convertToUTC8(created_at)
        ),
      };
    });

    return NextResponse.json(
      {
        isSuccess: true,
        message: "Data fetched successfully.",
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

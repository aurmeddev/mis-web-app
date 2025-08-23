import { query } from "@/database/dbConnection";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { DatetimeUtils } from "@/lib/utils/date/DatetimeUtils";
import { MySqlUtils } from "@/lib/utils/mysql/MySqlUtils";
import { NextResponse, NextRequest } from "next/server";
export const GET = async (
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

  const searchKey = `${(await params).id}`;
  const mysqlUtils = new MySqlUtils();
  const { columns, values } = mysqlUtils.generateFindQuery({
    column: {
      search_key: searchKey,
    },
    operator: "LIKE",
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
        is_active, // Exclude search_key in the response
        fb_owner_account_created,
        search_key, // Exclude search_key in the response
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

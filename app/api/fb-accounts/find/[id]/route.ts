import { query } from "@/database/dbConnection";
import { SearchKeywordService } from "@/lib/features/search-keyword/SearchKeywordService";
import { CryptoServerService } from "@/lib/features/security/cryptography/CryptoServerService";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { DatetimeUtils } from "@/lib/utils/date/DatetimeUtils";
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

  const searchKeyword = `${(await params).id}`;
  let payload: object = {};
  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Invalid JSON payload.",
        data: [],
      },
      { status: 400 }
    );
  }

  const searchApi = new SearchKeywordService();
  const { queryString, values, isSuccess, message } = searchApi.search({
    searchKeyword,
    requestUrlSearchParams: request.nextUrl.searchParams,
    dynamicSearchPayload: payload,
    databaseTableName: "v_FbAccounts",
    staticSearchField: "base_search_keyword",
  });

  if (!isSuccess) {
    return NextResponse.json(
      {
        isSuccess,
        message,
        data: [],
      },
      { status: 400 }
    );
  }

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

    const cipher = new CryptoServerService();
    const dateUtils = new DatetimeUtils();
    const formattedResponse = await Promise.all(
      response.map(async (item: any) => {
        const {
          created_at,
          is_active, // Exclude base_search_keyword in the response.
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

        return {
          ...rest,
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

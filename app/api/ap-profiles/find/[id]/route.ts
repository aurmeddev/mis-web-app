import { query } from "@/database/dbConnection";
import { FindApProfilesProps } from "@/lib/features/ap-profiles/type/ApProfilesProps";
import { SearchKeywordService } from "@/lib/features/search-keyword/SearchKeywordService";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
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

  const searchKeyword = `${(await params).id}`;
  const payload: object = await request.json();

  const searchApi = new SearchKeywordService();
  const { queryString, values } = searchApi.search({
    searchKeyword,
    requestUrlSearchParams: request.nextUrl.searchParams,
    dynamicSearchPayload: payload,
    databaseTableName: "v_ApProfiles",
    staticSearchField: "profile_name",
  });

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

    return NextResponse.json(
      {
        isSuccess: true,
        message: "Data fetched successfully.",
        data: response,
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

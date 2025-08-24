import { query } from "@/database/dbConnection";
import { FindApProfilesProps } from "@/lib/features/ap-profiles/type/ApProfilesProps";
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

  type FindMethodProps = Omit<
    FindApProfilesProps,
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
      profile_name: searchKeyword,
    };
  }

  const mysqlUtils = new MySqlUtils();
  const { columns, values } = mysqlUtils.generateFindQuery({
    column: column,
    operator: method === "find-one" ? "equals" : "like", // Default to "like" if not provided
  });
  const queryString = `SELECT * FROM v_ApProfiles WHERE ${columns} LIMIT 3`;
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

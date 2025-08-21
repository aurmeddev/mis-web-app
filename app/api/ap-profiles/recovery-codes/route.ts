import { query } from "@/database/dbConnection";
import { PostRecoveryCodesProps } from "@/lib/features/ap-profiles/type/ApProfilesProps";
import { MySqlUtils } from "@/lib/utils/mysql/MySqlUtils";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { NextResponse, NextRequest } from "next/server";
export const POST = async (request: NextRequest) => {
  // Check if the user session is valid before processing the request
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Session expired or invalid",
      },
      { status: 403 }
    );
  }

  const data: PostRecoveryCodesProps = await request.json();
  // Validate the data before proceeding
  const { recovery_code, ap_profile_id } = data;
  if (!recovery_code || recovery_code.length === 0) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "No recovery codes provided.",
        data: [],
      },
      { status: 200 }
    );
  }

  const mysqlUtils = new MySqlUtils();
  const { columns, values, questionMarksValue } =
    mysqlUtils.generateInsertQuery({ recovery_code, ap_profile_id });
  const queryString = `INSERT INTO Recovery_Codes ${columns} ${questionMarksValue}`;
  console.log(queryString);
  console.log(values);

  // Execute the query to insert recovery codes into the database
  try {
    await query({
      query: queryString,
      values: values,
    });

    return NextResponse.json(
      {
        isSuccess: true,
        message: "Recovery codes have been submitted successfully.",
        data: [],
      },
      { status: 201 }
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

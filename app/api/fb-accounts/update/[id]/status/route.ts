import { query } from "@/database/query";
import { ToggleFbAccountQualityStatusProps } from "@/lib/features/fb-accounts/type/FbAccountsProps";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { MySqlUtils } from "@/lib/utils/mysql/MySqlUtils";
import { NextResponse, NextRequest } from "next/server";
export const PUT = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
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

  const fbAccountId = `${(await params).id}`;
  const data: ToggleFbAccountQualityStatusProps = await request.json();
  const { fb_account_quality_type_id } = data;
  if (
    (fb_account_quality_type_id && fb_account_quality_type_id < 0) ||
    (fb_account_quality_type_id && fb_account_quality_type_id > 1)
  ) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: `Invalid status value. It must be either "0" for inactive or "1" for active.`,
        data: [],
      },
      { status: 400 }
    );
  }

  const mysqlUtils = new MySqlUtils();
  const { columns, values, whereClause } = mysqlUtils.generateUpdateQuery({
    fb_account_quality_type_id: fb_account_quality_type_id,
    id: fbAccountId,
  });
  const queryString = `UPDATE Fb_Accounts ${columns} ${whereClause}`;
  console.log(queryString);
  console.log(values);

  // Execute the query to update status in the database
  try {
    await query({
      query: queryString,
      values: values,
    });
    return NextResponse.json(
      {
        isSuccess: true,
        message: `The FB account quality has been ${
          fb_account_quality_type_id ? "passed" : "rejected"
        } successfully.`,
        data: [
          {
            fb_account_quality: fb_account_quality_type_id
              ? "passed"
              : "rejected",
          },
        ],
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

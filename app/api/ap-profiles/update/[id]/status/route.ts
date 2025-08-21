import { query } from "@/database/dbConnection";
import { ToggleApProfilesStatusProps } from "@/lib/features/ap-profiles/type/ApProfilesProps";
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

  const apProfileId = `${(await params).id}`;
  const data: ToggleApProfilesStatusProps = await request.json();
  const { is_active } = data;
  if (is_active < 0 || is_active >= 2) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Incorrect active value.",
        data: [],
      },
      { status: 400 }
    );
  }

  const mysqlUtils = new MySqlUtils();
  const { columns, values, whereClause } = mysqlUtils.generateUpdateQuery({
    is_active: is_active,
    id: apProfileId,
  });
  const queryString = `UPDATE Ap_Profiles ${columns} ${whereClause}`;
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
        message: `AP Profile has been ${
          is_active ? "activated" : "deactivated"
        } successfully.`,
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

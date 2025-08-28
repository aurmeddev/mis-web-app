import { query } from "@/database/dbConnection";
import { FbAccountsServerService } from "@/lib/features/fb-accounts/FbAccountsServerService";
import { UpdateFbAccountsProps } from "@/lib/features/fb-accounts/type/FbAccountsProps";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { MySqlUtils } from "@/lib/utils/mysql/MySqlUtils";
import { ObjectUtils } from "@/lib/utils/object/ObjectUtils";
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
  const data: UpdateFbAccountsProps = await request.json();
  const objUtil = new ObjectUtils();
  const validationPostQueryParams = objUtil.removeInvalidKeys({
    fb_owner_name: data.fb_owner_name,
    contact_no: data.contact_no || "",
    email_address: data.email_address || "",
    username: data.username,
  });

  if (objUtil.isValidObject(validationPostQueryParams)) {
    // Validate if the fb account already exists
    const fbs = new FbAccountsServerService();
    const customSearchParams = new URLSearchParams();
    customSearchParams.set("method", "find-one");
    customSearchParams.set("condition", "all");
    const validationResponse = await fbs.find({
      searchKeyword: "validation",
      requestUrlSearchParams: customSearchParams,
      payload: validationPostQueryParams,
    });

    if (!validationResponse.isSuccess) {
      return NextResponse.json(
        {
          isSuccess: false,
          message: "Validation error occurred.",
          data: [],
        },
        { status: 400 }
      );
    }
    const doesApProfileExist = validationResponse.data.length > 0;
    if (doesApProfileExist) {
      return NextResponse.json(
        {
          isSuccess: false,
          message:
            "The FB account information you provided already exists. Please check and try again.",
          data: [],
        },
        { status: 409 }
      );
    }
  }

  const { id, ...payload } = objUtil.removeInvalidKeys(data);
  const mysqlUtils = new MySqlUtils();
  const { columns, values, whereClause } = mysqlUtils.generateUpdateQuery({
    ...payload,
    id: fbAccountId,
  });
  const queryString = `UPDATE Fb_Accounts ${columns} ${whereClause}`;
  console.log(queryString);
  console.log(values);

  // Execute the query to insert data into the database
  try {
    await query({
      query: queryString,
      values: values,
    });

    return NextResponse.json(
      {
        isSuccess: true,
        message: "Data have been submitted successfully.",
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

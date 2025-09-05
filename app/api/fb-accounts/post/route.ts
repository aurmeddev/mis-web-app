import { query } from "@/database/dbConnection";
import { MySqlUtils } from "@/lib/utils/mysql/MySqlUtils";
import { ObjectUtils } from "@/lib/utils/object/ObjectUtils";
import { CryptoServerService } from "@/lib/features/security/cryptography/CryptoServerService";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { NextResponse, NextRequest } from "next/server";
import { PostFbAccountsProps } from "@/lib/features/fb-accounts/type/FbAccountsProps";
import { FbAccountsServerService } from "@/lib/features/fb-accounts/FbAccountsServerService";
import { DatetimeUtils } from "@/lib/utils/date/DatetimeUtils";
import { getServerCurrentDatetime } from "../../ap-profiles/post/route";
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

  // Decrypt the user ID from the session
  const decipher = new CryptoServerService();
  const { isSuccess, decryptedData } = await decipher.decrypt({
    data: session.user.id,
  });
  if (!isSuccess) {
    return NextResponse.json(
      {
        isSuccess,
        message: "Data parse error occurred.",
      },
      { status: 500 }
    );
  }
  const USER_ID = decryptedData;
  const FULL_NAME = session.user.full_name;
  const TEAM_NAME = session.user.team_name;

  const data: PostFbAccountsProps = await request.json();
  const objUtil = new ObjectUtils();
  const fbs = new FbAccountsServerService();
  const validationPostQueryParams = objUtil.removeInvalidKeys({
    data: {
      fb_owner_name: data.fb_owner_name,
      contact_no: data.contact_no || "",
      email_address: data.email_address || "",
      username: data.username,
    },
    isStrictMode: true,
  });

  // Validate if the fb account already exists
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

  const payload = objUtil.removeInvalidKeys({ data, isStrictMode: true });
  const mysqlUtils = new MySqlUtils();
  const { columns, values, questionMarksValue } =
    mysqlUtils.generateInsertQuery({ recruited_by: USER_ID, ...payload });
  const queryString = `INSERT INTO Fb_Accounts ${columns} ${questionMarksValue}`;
  console.log(queryString);
  console.log(values);

  // Execute the query to insert data into the database
  try {
    const response: any = await query({
      query: queryString,
      values: values,
    });

    const dateUtils = new DatetimeUtils();
    const { insertId } = response;

    const result = [
      {
        id: insertId,
        status: "available",
        recruited_by: {
          full_name: FULL_NAME,
          team_name: TEAM_NAME,
        },
        created_at: dateUtils.formatDateTime(
          dateUtils.convertToUTC8(await getServerCurrentDatetime())
        ),
      },
    ];
    return NextResponse.json(
      {
        isSuccess: true,
        message: "Data have been submitted successfully.",
        data: result,
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

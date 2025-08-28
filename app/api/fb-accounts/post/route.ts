import { query } from "@/database/dbConnection";
import { MySqlUtils } from "@/lib/utils/mysql/MySqlUtils";
import { ObjectUtils } from "@/lib/utils/object/ObjectUtils";
import { CryptoServerService } from "@/lib/features/security/cryptography/CryptoServerService";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { NextResponse, NextRequest } from "next/server";
import { PostFbAccountsProps } from "@/lib/features/fb-accounts/type/FbAccountsProps";
import { FbAccountsService } from "@/lib/features/fb-accounts/FbAccountsService";
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

  const data: PostFbAccountsProps = await request.json();
  const objUtil = new ObjectUtils();
  const fbs = new FbAccountsService();
  const validationPostQueryParams = objUtil.removeInvalidKeys({
    fb_owner_name: data.fb_owner_name,
    contact_no: data.contact_no || "",
    email_address: data.email_address || "",
    username: data.username,
  });

  // Validate if the fb account already exists
  const validationResponse = await fbs.find({
    searchKeyword: "validation",
    method: "find-one",
    condition: "all",
    dynamicSearchPayload: validationPostQueryParams,
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

  const payload = objUtil.removeInvalidKeys(data);
  const mysqlUtils = new MySqlUtils();
  const { columns, values, questionMarksValue } =
    mysqlUtils.generateInsertQuery({ recruited_by: USER_ID, ...payload });
  const queryString = `INSERT INTO Fb_Accounts ${columns} ${questionMarksValue}`;
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

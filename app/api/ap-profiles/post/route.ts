import { query } from "@/database/dbConnection";
import { PostApProfilesProps } from "@/lib/features/ap-profiles/type/ApProfilesProps";
import { MySqlUtils } from "@/lib/utils/mysql/MySqlUtils";
import { ObjectUtils } from "@/lib/utils/object/ObjectUtils";
import { CryptoServerService } from "@/lib/features/security/cryptography/CryptoServerService";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { NextResponse, NextRequest } from "next/server";
import { ApProfilesService } from "@/lib/features/ap-profiles/ApProfilesService";
export const POST = async (request: NextRequest) => {
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

  // // Decrypt the user ID from the session
  // const decipher = new CryptoServerService();
  // const { isSuccess, decryptedData } = await decipher.decrypt({
  //   data: session.user.id,
  // });
  // if (!isSuccess) {
  //   return NextResponse.json(
  //     {
  //       isSuccess,
  //       message: "Data parse error occurred.",
  //     },
  //     { status: 500 }
  //   );
  // }

  const data: PostApProfilesProps = await request.json();
  const objUtil = new ObjectUtils();
  const aps = new ApProfilesService();
  const validationPostQueryParams = objUtil.removeInvalidKeys({
    profile_name: data.profile_name,
    fb_account_id: data.fb_account_id || "",
  });
  // Validate if the AP Profile already exists
  const validationResponse = await aps.find({
    searchKeyword: "dynamic-search",
    method: "find-one",
    condition: "at-least-one",
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
          "The AP profile information you provided already exists. Please check the profile name or assigned fb account and try again.",
        data: [],
      },
      { status: 409 }
    );
  }

  const payload = objUtil.removeInvalidKeys(data);
  const mysqlUtils = new MySqlUtils();
  const { columns, values, questionMarksValue } =
    mysqlUtils.generateInsertQuery({ created_by: 1, ...payload });
  const queryString = `INSERT INTO Ap_Profiles ${columns} ${questionMarksValue}`;
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

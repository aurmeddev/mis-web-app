import { query } from "@/database/dbConnection";
import { PostApProfilesProps } from "@/lib/features/ap-profiles/type/ApProfilesProps";
import { MySqlUtils } from "@/lib/utils/mysql/MySqlUtils";
import { ObjectUtils } from "@/lib/utils/object/ObjectUtils";
import { CryptoServerService } from "@/lib/features/security/cryptography/CryptoServerService";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { NextResponse, NextRequest } from "next/server";
import { FbAccountsService } from "@/lib/features/fb-accounts/FbAccountsService";
import { DatetimeUtils } from "@/lib/utils/date/DatetimeUtils";
import { ApProfilesServerService } from "@/lib/features/ap-profiles/ApProfilesServerService";
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

  const data: PostApProfilesProps = await request.json();
  const objUtil = new ObjectUtils();
  const aps = new ApProfilesServerService();
  const fbs = new FbAccountsService();
  const validationPostQueryParams = objUtil.removeInvalidKeys({
    profile_name: data.profile_name,
    fb_account_id: data.fb_account_id,
  });

  // Validate if the AP Profile already exists
  const customSearchParams = new URLSearchParams();
  customSearchParams.set("method", "find-one");
  customSearchParams.set("condition", "at-least-one");
  const validationResponse = await aps.find({
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
          "The AP profile information you provided already exists. Please check the profile name or assigned fb account and try again.",
        data: [],
      },
      { status: 409 }
    );
  }

  let payload = objUtil.removeInvalidKeys(data);
  const isFbAccountIdProvided =
    payload.fb_account_id && payload.fb_account_id > 0;

  if (isFbAccountIdProvided) {
    payload = { ...payload, is_active: 1 }; // Set the status to active if fb_account_id is provided

    // Validate if the assigned fb_account_id exists in FB Accounts db table
    const validationResponse = await fbs.find({
      searchKeyword: "validation",
      method: "find-one",
      dynamicSearchPayload: { id: payload.fb_account_id },
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

    const doesFbAccountIdNotExist = validationResponse.data.length === 0;
    if (doesFbAccountIdNotExist) {
      return NextResponse.json(
        {
          isSuccess: false,
          message: `The FB account you've assigned to ${payload.profile_name} does not exist. Unable to proceed.`,
          data: [],
        },
        { status: 400 }
      );
    }
  }
  const mysql = new MySqlUtils();
  const { columns, values, questionMarksValue } = mysql.generateInsertQuery({
    created_by: USER_ID,
    ...payload,
  });
  const queryString = `INSERT INTO Ap_Profiles ${columns} ${questionMarksValue}`;
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

    let getFbAccountInfo: any;
    if (data.fb_account_id && data.fb_account_id > 0) {
      const { data } = await fbs.find({
        searchKeyword: "validation",
        method: "find-one",
        dynamicSearchPayload: { id: payload.fb_account_id },
      });

      getFbAccountInfo = data[0];
    }

    const result = [
      {
        id: insertId,
        fb_account_id: data.fb_account_id || 0,
        profile_name: data.profile_name,
        remarks: data.remarks || null,
        fb_account: getFbAccountInfo || {},
        status: isFbAccountIdProvided ? "active" : "available",
        created_by: {
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

export const getServerCurrentDatetime = async () => {
  const date: any = await query({
    query: "SELECT CURRENT_TIMESTAMP AS date_now;",
    values: [],
  });
  return date[0].date_now;
};

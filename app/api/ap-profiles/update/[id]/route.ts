import { query } from "@/database/dbConnection";
import { ApProfilesService } from "@/lib/features/ap-profiles/ApProfilesService";
import { UpdateApProfilesProps } from "@/lib/features/ap-profiles/type/ApProfilesProps";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { MySqlUtils } from "@/lib/utils/mysql/MySqlUtils";
import { ObjectUtils } from "@/lib/utils/object/ObjectUtils";
import { NextResponse, NextRequest } from "next/server";
export const PUT = async (
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

  const apProfileId = `${(await params).id}`;
  const data: UpdateApProfilesProps = await request.json();
  const { id, ...prop } = data;
  const { isSuccess, message, status } = await validateFbAccountAssignment({
    fb_account_id: prop.fb_account_id,
    profile_name: prop.profile_name,
  });

  if (!isSuccess) {
    return NextResponse.json(
      {
        isSuccess,
        message,
      },
      { status: status }
    );
  }

  const objUtil = new ObjectUtils();
  const payload = {
    ...prop,
    profile_name: prop.profile_name,
    fb_account_id: prop.fb_account_id,
  };

  let validationUpdateQueryParams: { [key: string]: any } = {};
  if (payload.fb_account_id && payload.fb_account_id === 0) {
    // Remove FB Account from the AP Profile
    const { fb_account_id, ...rest } = payload;
    validationUpdateQueryParams = objUtil.removeInvalidKeys(rest);
    validationUpdateQueryParams.fb_account_id = fb_account_id;
  } else {
    validationUpdateQueryParams = objUtil.removeInvalidKeys(payload);
  }

  const mysqlUtils = new MySqlUtils();
  const { columns, values, whereClause } = mysqlUtils.generateUpdateQuery({
    ...validationUpdateQueryParams,
    id: apProfileId,
  });
  const queryString = `UPDATE Ap_Profiles ${columns} ${whereClause}`;
  console.log(queryString);
  console.log(values);

  // Execute the query to update data in the database
  try {
    await query({
      query: queryString,
      values: values,
    });
    return NextResponse.json(
      {
        isSuccess: true,
        message: "Data have been updated successfully.",
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

type ValidateFbAccountAssignmentProps = Omit<
  UpdateApProfilesProps,
  "id" | "remarks"
>;
// Validate if the fb account does not assign to another profile
const validateFbAccountAssignment = async (
  params: ValidateFbAccountAssignmentProps
) => {
  const { fb_account_id, profile_name } = params;
  const aps = new ApProfilesService();

  if (fb_account_id) {
    const validationResponse = await aps.find({
      searchKeyword: "validation",
      method: "find-one",
      dynamicSearchPayload: {
        fb_account_id: fb_account_id,
      },
    });

    if (!validationResponse.isSuccess) {
      return {
        isSuccess: false,
        message: "Validation error occurred.",
        status: 400,
      };
    }
    const hasExist = validationResponse.data.length > 0;
    if (hasExist) {
      return {
        isSuccess: false,
        message:
          "The FB account is currently assigned to another AP profile. Please check and try again.",
        status: 409,
      };
    }
  }

  if (profile_name) {
    const validationResponse = await aps.find({
      searchKeyword: "validation",
      method: "find-one",
      dynamicSearchPayload: {
        profile_name: profile_name,
      },
    });

    if (!validationResponse.isSuccess) {
      return {
        isSuccess: false,
        message: "Validation error occurred.",
        status: 400,
      };
    }

    const hasExist = validationResponse.data.length > 0;
    if (hasExist) {
      return {
        isSuccess: false,
        message:
          "The new profile name you provided already exists. Please check and try again.",
        status: 409,
      };
    }
  }

  return {
    isSuccess: true,
    message: "Ok",
    status: 200,
  };
};

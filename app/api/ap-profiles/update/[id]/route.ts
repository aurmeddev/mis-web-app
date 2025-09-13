import { query } from "@/database/dbConnection";
import { ApProfilesServerService } from "@/lib/features/ap-profiles/ApProfilesServerService";
import { UpdateApProfilesProps } from "@/lib/features/ap-profiles/type/ApProfilesProps";
import { FbAccountsServerService } from "@/lib/features/fb-accounts/FbAccountsServerService";
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

  const profileId = `${(await params).id}`;
  const data: UpdateApProfilesProps = await request.json();
  const { id, marketing_api_access_token, app_secret_key, ...prop } = data;

  const isMarketingApiAccessTokenValid =
    marketing_api_access_token !== undefined &&
    marketing_api_access_token !== null;
  const isAppSecretKeyValid =
    app_secret_key !== undefined && app_secret_key !== null;
  const fbs = new FbAccountsServerService();
  if (
    hasOnlyTheAppSecretKeyOrAccessTokenChanged({
      ...prop,
      isMarketingApiAccessTokenValid,
      isAppSecretKeyValid,
    })
  ) {
    const token: Record<string, any> = {};
    console.log(
      "Ang app_secret_key or marketing_api_access_token ang naay changes"
    );
    if (isMarketingApiAccessTokenValid) {
      token.marketing_api_access_token = marketing_api_access_token;
    }
    if (isAppSecretKeyValid) {
      token.app_secret_key = app_secret_key;
    }
    // Update Fb Account's marketing api acccess token
    const addAccessToken = await fbs.update({
      id: Number(prop.new_fb_account_id) || prop.fb_account_id,
      ...token,
    });

    if (!addAccessToken.isSuccess) {
      NextResponse.json(
        {
          isSuccess: addAccessToken.isSuccess,
          message: addAccessToken.message,
          data: [],
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        isSuccess: true,
        message: "The access token have been updated successfully.",
        data: [{ ...token }],
      },
      { status: 201 }
    );
  }

  const { isSuccess, message, status } = await validateFbAccountAssignment({
    new_fb_account_id: prop.new_fb_account_id,
    new_profile_name: prop.new_profile_name,
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

  // Check if there's any changes on the ap profile info

  const payload: { [key: string]: any } = {};
  const hasFbAccountRemoved = prop.new_fb_account_id === 0;
  const hasProfileAssignedNewFbAccount =
    prop.new_fb_account_id && prop.fb_account_id !== prop.new_fb_account_id;
  const hasProfileNameChanged =
    prop.new_profile_name && prop.profile_name !== prop.new_profile_name;

  if (hasFbAccountRemoved) {
    // Remove FB Account from the AP Profile
    payload.fb_account_id = 0;
    payload.is_active = 0; // Set status to available
  } else if (hasProfileAssignedNewFbAccount) {
    payload.fb_account_id = prop.new_fb_account_id;
    payload.is_active = 1; // Set status to active
  }

  // Update the profile name if it has changed.
  if (hasProfileNameChanged) {
    payload.profile_name = prop.new_profile_name;
  }

  // Update remarks if a value is provided (even an empty string or 0).
  const hasRemarksChanged = prop.remarks !== undefined;
  if (hasRemarksChanged) {
    payload.remarks = prop.remarks;
  }

  const mysqlUtils = new MySqlUtils();
  const { columns, values, whereClause } = mysqlUtils.generateUpdateQuery({
    ...payload,
    id: profileId,
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

    let getFbAccountInfo: any = {};
    const customSearchParams = new URLSearchParams();
    customSearchParams.set("method", "find-one");
    if ((prop.new_fb_account_id ?? 0) > 0) {
      const { data } = await fbs.find({
        searchKeyword: "validation",
        requestUrlSearchParams: customSearchParams,
        payload: { id: prop.new_fb_account_id },
      });

      getFbAccountInfo = data[0];
    }

    if (
      (isMarketingApiAccessTokenValid && !hasFbAccountRemoved) ||
      (isAppSecretKeyValid && !hasFbAccountRemoved)
    ) {
      const token: Record<string, any> = {};
      console.log(
        "Naay changes sa AP profile info ug sa app_secret_key or marketing_api_access_token"
      );
      if (isMarketingApiAccessTokenValid) {
        token.marketing_api_access_token = marketing_api_access_token;
      }
      if (isAppSecretKeyValid) {
        token.app_secret_key = app_secret_key;
      }
      // Update marketing api acccess token in Fb Account
      const fbAccountId = hasProfileAssignedNewFbAccount
        ? Number(prop.new_fb_account_id)
        : prop.fb_account_id;
      const addAccessToken = await fbs.update({
        id: fbAccountId,
        ...token,
      });

      if (!addAccessToken.isSuccess) {
        NextResponse.json(
          {
            isSuccess: addAccessToken.isSuccess,
            message: addAccessToken.message,
            data: [],
          },
          { status: 400 }
        );
      }

      getFbAccountInfo = { ...getFbAccountInfo, ...token };
    }

    const aps = new ApProfilesServerService();
    const { data } = await aps.find({
      searchKeyword: "validation",
      requestUrlSearchParams: customSearchParams,
      payload: {
        id: profileId,
      },
    });

    const response = [
      {
        fb_account_id: prop.new_fb_account_id ?? prop.fb_account_id,
        fb_account: getFbAccountInfo || {},
        status: data[0].status,
      },
    ];
    return NextResponse.json(
      {
        isSuccess: true,
        message: "Data have been updated successfully.",
        data: response,
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
  "id" | "remarks" | "fb_account_id" | "profile_name"
>;
// Validate if the fb account does not assign to another profile
const validateFbAccountAssignment = async (
  params: ValidateFbAccountAssignmentProps
) => {
  const { new_fb_account_id, new_profile_name } = params;
  const aps = new ApProfilesServerService();

  const customSearchParams = new URLSearchParams();
  customSearchParams.set("method", "find-one");
  if (new_fb_account_id) {
    const validationResponse = await aps.find({
      searchKeyword: "validation",
      requestUrlSearchParams: customSearchParams,
      payload: {
        fb_account_id: new_fb_account_id,
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

  if (new_profile_name) {
    const validationResponse = await aps.find({
      searchKeyword: "validation",
      requestUrlSearchParams: customSearchParams,
      payload: {
        profile_name: new_profile_name,
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

type IsOnlyMarketingApiTokenChangedProps = {
  profile_name?: string;
  new_profile_name?: string;
  remarks?: string;
  fb_account_id: number;
  new_fb_account_id?: number;
  isMarketingApiAccessTokenValid: boolean;
  isAppSecretKeyValid: boolean;
};
const hasOnlyTheAppSecretKeyOrAccessTokenChanged = (
  params: IsOnlyMarketingApiTokenChangedProps
) => {
  const {
    fb_account_id,
    new_fb_account_id,
    isMarketingApiAccessTokenValid,
    isAppSecretKeyValid,
    ...rest
  } = params;

  const hasAssignedFbAccountOnly =
    new_fb_account_id !== 0 &&
    (!isMarketingApiAccessTokenValid || !isAppSecretKeyValid);
  if (hasAssignedFbAccountOnly) {
    return false;
  }

  const hasFbAccountRemoved = new_fb_account_id === 0;
  if (hasFbAccountRemoved) {
    return false;
  }

  const hasChanged = Object.values(rest).some(
    (value: any) => value !== undefined && value !== null
  );

  if (hasChanged) {
    return false;
  }

  if (
    (isMarketingApiAccessTokenValid || isAppSecretKeyValid) &&
    (fb_account_id || new_fb_account_id)
  ) {
    return true;
  }
};

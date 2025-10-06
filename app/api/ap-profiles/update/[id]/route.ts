import { query } from "@/database/query";
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

  const hasFbAccountRemoved = prop.new_fb_account_id === 0;
  const hasNewAssignedFbAccount =
    typeof prop.new_fb_account_id == "number" && prop.new_fb_account_id !== 0;

  if (
    hasOnlyTheAppSecretKeyOrAccessTokenChanged({
      profile_name: prop.profile_name,
      new_profile_name: prop.new_profile_name,
      remarks: prop.remarks,
      hasFbAccountRemoved,
      hasNewAssignedFbAccount,
      isMarketingApiAccessTokenValid,
      isAppSecretKeyValid,
    })
  ) {
    console.log(
      "Ang app_secret_key or marketing_api_access_token ang naay changes"
    );

    const fbAccountId = hasNewAssignedFbAccount
      ? prop.new_fb_account_id
      : prop.fb_account_id;

    if (typeof fbAccountId !== "number" || isNaN(fbAccountId)) {
      return NextResponse.json(
        {
          isSuccess: false,
          message: "Invalid Facebook Account ID.",
          data: [],
        },
        { status: 400 }
      );
    }

    // Update Fb Account's app secret key or marketing api acccess token
    const { isSuccess, data, message } = await updateAppSecretKeyAccessToken({
      fbAccountId: fbAccountId,
      app_secret_key,
      marketing_api_access_token,
    });

    if (!isSuccess) {
      NextResponse.json(
        {
          isSuccess,
          message,
          data,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        isSuccess: true,
        message: "The access token have been updated successfully.",
        data: data,
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
  const hasProfileNameChanged =
    typeof prop.profile_name == "string" &&
    typeof prop.new_profile_name == "string" &&
    prop.profile_name !== prop.new_profile_name;

  if (hasFbAccountRemoved) {
    // Remove FB Account from the AP Profile
    payload.fb_account_id = 0;
    payload.is_active = 0; // Set status to available
  } else if (hasNewAssignedFbAccount) {
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

    const fbAccountId = hasNewAssignedFbAccount
      ? prop.new_fb_account_id
      : prop.fb_account_id;

    if (
      (isMarketingApiAccessTokenValid && !hasFbAccountRemoved) ||
      (isAppSecretKeyValid && !hasFbAccountRemoved)
    ) {
      console.log(
        "Naay changes sa AP profile info ug sa app_secret_key or marketing_api_access_token"
      );

      if (typeof fbAccountId !== "number" || isNaN(fbAccountId)) {
        return NextResponse.json(
          {
            isSuccess: false,
            message: "Invalid Facebook Account ID.",
            data: [],
          },
          { status: 400 }
        );
      }

      // Update Fb Account's app secret key or marketing api acccess token
      const { isSuccess, data, message } = await updateAppSecretKeyAccessToken({
        fbAccountId: fbAccountId,
        app_secret_key,
        marketing_api_access_token,
      });

      if (!isSuccess) {
        NextResponse.json(
          {
            isSuccess,
            message,
            data,
          },
          { status: 400 }
        );
      }

      const { status, ...rest } = data[0];
      getFbAccountInfo = rest.fb_account;
    } else {
      const fbs = new FbAccountsServerService();
      const { isSuccess, data, message } = await fbs.find({
        searchKeyword: "validation",
        requestUrlSearchParams: customSearchParams,
        payload: {
          id: fbAccountId,
        },
      });

      if (!isSuccess) {
        NextResponse.json(
          {
            isSuccess,
            message,
            data,
          },
          { status: 400 }
        );
      }

      getFbAccountInfo = formatFbAccountInfo(data);
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
        fb_account: getFbAccountInfo,
        status: data[0].status,
      },
    ];
    return NextResponse.json(
      {
        isSuccess: true,
        message: "Data has been updated successfully.",
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
  hasFbAccountRemoved: boolean;
  hasNewAssignedFbAccount: boolean;
  isMarketingApiAccessTokenValid: boolean;
  isAppSecretKeyValid: boolean;
};
const hasOnlyTheAppSecretKeyOrAccessTokenChanged = (
  params: IsOnlyMarketingApiTokenChangedProps
) => {
  const {
    hasFbAccountRemoved,
    hasNewAssignedFbAccount,
    isMarketingApiAccessTokenValid,
    isAppSecretKeyValid,
    ...rest
  } = params;

  if (hasFbAccountRemoved) {
    return false; // The FB account from the profile has removed.
  }

  if (
    hasNewAssignedFbAccount &&
    (isAppSecretKeyValid || isMarketingApiAccessTokenValid)
  ) {
    return false; // The assigned FB account and app secret key/access token changed.
  }

  if (
    Object.values(rest).some(
      (value: any) => value !== undefined && value !== null
    )
  ) {
    return false; // Either the profile name or the remarks have changed.
  }

  if (!isAppSecretKeyValid && !isMarketingApiAccessTokenValid) {
    return false;
  }

  return true;
};

type UpdateAppSecretKeyAccessTokenProps = {
  fbAccountId: number;
  marketing_api_access_token: string | null | undefined;
  app_secret_key: string | null | undefined;
};
const updateAppSecretKeyAccessToken = async (
  params: UpdateAppSecretKeyAccessTokenProps
) => {
  const { fbAccountId, ...rest } = params;
  const payload: Record<string, any> = {};

  type RestKeys = keyof typeof rest;
  for (const prop of Object.keys(rest) as RestKeys[]) {
    const value = rest[prop];
    if (value !== undefined && value !== null) {
      payload[prop] = value;
    }
  }

  const fbs = new FbAccountsServerService();
  // Update Fb Account's app secret key or marketing api acccess token
  const { isSuccess, data, message } = await fbs.update({
    id: fbAccountId,
    ...payload,
  });

  if (!isSuccess) {
    return { isSuccess, data, message };
  }

  const customSearchParams = new URLSearchParams();
  customSearchParams.set("method", "find-one");
  const fbAccountInfoResult = await fbs.find({
    searchKeyword: "validation",
    requestUrlSearchParams: customSearchParams,
    payload: {
      id: fbAccountId,
    },
  });

  if (!fbAccountInfoResult.isSuccess) {
    return {
      isSuccess: fbAccountInfoResult.isSuccess,
      message: fbAccountInfoResult.message,
      data: [],
    };
  }

  return {
    isSuccess: true,
    message: "Data has been updated successfully.",
    data: [
      {
        fb_account: formatFbAccountInfo(fbAccountInfoResult.data),
        status: "active", // Returns profile's status
      },
    ],
  };
};

const formatFbAccountInfo = (data: any) => {
  const formattedFbAccountInfo = data.map((element: any) => {
    const {
      id,
      fb_owner_name,
      username,
      app_secret_key,
      marketing_api_access_token,
      recruited_by,
    } = element;
    return {
      id,
      fb_owner_name,
      username,
      app_secret_key,
      marketing_api_access_token,
      recruited_by,
    };
  });

  return { ...formattedFbAccountInfo[0] };
};

// import { CryptoServerService } from "@/lib/features/security/cryptography/CryptoServerService";
import { CryptoUtilsServerService } from "@/lib/features/security/cryptography/util/CryptoUtilsServerService";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { PostUserBrandPermissionsProps } from "@/lib/features/users/permissions/type/UserPermissionsProps";
import { UserPermissionsServerController } from "@/lib/features/users/permissions/UserPermissionsServerController";
import { NextResponse, NextRequest } from "next/server";
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

  // const USER_ID = decryptedData;

  const { user_id, brand_id }: PostUserBrandPermissionsProps =
    await request.json();

  if (!Array.isArray(brand_id)) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Invalid brand IDs provided.",
        data: [],
      },
      { status: 400 }
    );
  }

  if (brand_id.length === 0) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Brand IDs is required.",
        data: [],
      },
      { status: 400 }
    );
  }

  const cryptoUtil = new CryptoUtilsServerService();
  const decryptResult = await cryptoUtil.cryptoArrayString({
    data: user_id,
    isEncrypt: false,
  });

  const decryptedUserIds = decryptResult.array();
  const isValidUserIds = decryptedUserIds.some((id) => !isNaN(Number(id)));
  if (!isValidUserIds) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Data parse error occurred.",
        data: [],
      },
      { status: 400 }
    );
  }

  const user = new UserPermissionsServerController();
  const { isSuccess, data, message } = await user.postUserBrandPermissions({
    user_id: decryptedUserIds,
    brand_id,
  });

  return NextResponse.json(
    {
      isSuccess,
      message,
      data,
    },
    { status: isSuccess ? 201 : 400 }
  );
};

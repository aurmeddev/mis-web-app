import { CryptoServerService } from "@/lib/features/security/cryptography/CryptoServerService";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { UpdateUsersProps } from "@/lib/features/users/manage/type/UsersProps";
import { UsersServerController } from "@/lib/features/users/manage/UsersServerController";
import { ObjectUtils } from "@/lib/utils/object/ObjectUtils";
import { NextResponse, NextRequest } from "next/server";
export const PUT = async (request: NextRequest) => {
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

  const user = new UsersServerController();
  const payload: UpdateUsersProps = await request.json();
  const { id, email, password, ...rest } = payload;

  const objUtil = new ObjectUtils();
  if (!objUtil.isValidObject(rest)) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Invalid update payload. No fields to update.",
        data: [],
      },
      { status: 400 }
    );
  }

  const newPayload: any = rest;
  const cipher = new CryptoServerService();
  const result = await cipher.decrypt({
    data: id,
  });

  if (!result.isSuccess) {
    return NextResponse.json(
      {
        isSuccess: result.isSuccess,
        message: "Data parse error occurred.",
      },
      { status: 500 }
    );
  }

  if (password) {
    const { isSuccess, encryptedData } = await cipher.encrypt({
      data: password,
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
    newPayload.password = encryptedData;
  }

  if (email) {
    const { isSuccess, message, data } = await user.verifyEmail(email);
    if (!isSuccess) {
      return NextResponse.json(
        {
          isSuccess,
          message,
          data: [],
        },
        { status: data[0].code }
      );
    }
    newPayload.email = email;
  }

  const response = await user.update({
    id: result.decryptedData,
    ...newPayload,
  });

  return NextResponse.json(response, {
    status: response.isSuccess ? 201 : 500,
  });
};

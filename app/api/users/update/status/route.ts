import { CryptoServerService } from "@/lib/features/security/cryptography/CryptoServerService";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { ToggleStatusUserProps } from "@/lib/features/users/manage/type/UserProps";
import { UserServerController } from "@/lib/features/users/manage/UserServerController";
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

  const payload: ToggleStatusUserProps = await request.json();
  const { id, is_active } = payload;
  const decipher = new CryptoServerService();
  const result = await decipher.decrypt({
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

  if (is_active < 0 || is_active > 1) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: `Invalid status value. It must be either "0" for inactive or "1" for active.`,
        data: [],
      },
      { status: 400 }
    );
  }

  const user = new UserServerController();
  const response = await user.toggleStatus({
    id: result.decryptedData,
    is_active,
  });

  return NextResponse.json(response, {
    status: response.isSuccess ? 201 : 500,
  });
};

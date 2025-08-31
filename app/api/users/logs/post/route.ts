import { CryptoServerService } from "@/lib/features/security/cryptography/CryptoServerService";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { PostUsersLogsProps } from "@/lib/features/users/logs/type/UsersLogsProps";
import { UsersLogsServerService } from "@/lib/features/users/logs/UsersLogsServerService";
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
  const params: Omit<PostUsersLogsProps, "created_by"> = await request.json();
  const payload = {
    log_type_id: params.log_type_id,
    description: params.description,
    created_by: USER_ID,
  };
  const log = new UsersLogsServerService();
  const logResponse = await log.post(payload);

  if (!logResponse.isSuccess) {
    return NextResponse.json(
      {
        isSuccess: logResponse.isSuccess,
        message: logResponse.message,
        data: [],
      },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      isSuccess: logResponse.isSuccess,
      message: logResponse.message,
      data: [],
    },
    { status: 201 }
  );
};

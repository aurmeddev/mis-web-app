import { UserAuthManager } from "@/lib/features/security/user-auth/UserAuthManager";
import { UserAuthServerService } from "@/lib/features/security/user-auth/UserAuthServerService";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";

export const POST = async () => {
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

  const auth = new UserAuthManager(new UserAuthServerService());
  const response = await auth.destroySession();
  if (!response.isSuccess) {
    return NextResponse.json(response, { status: 201 });
  }

  return NextResponse.json(response, { status: 201 });
};

import { UserIpWhitelistManager } from "@/lib/features/user-ip-whitelist/UserIpWhitelistManager";
import { UserIpWhitelistServerService } from "@/lib/features/user-ip-whitelist/UserIpWhitelistServerService";
import { getSession } from "@/lib/security/user-auth/jwt/JwtAuthService";
import { NextResponse, NextRequest } from "next/server";

export const PUT = async (request: NextRequest) => {
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

  const payload = await request.json();
  const service = new UserIpWhitelistManager(
    new UserIpWhitelistServerService()
  );

  const response = await service.update(payload);

  if (!response.isSuccess) {
    return NextResponse.json(response, { status: 500 });
  }

  return NextResponse.json(response, { status: 201 });
};

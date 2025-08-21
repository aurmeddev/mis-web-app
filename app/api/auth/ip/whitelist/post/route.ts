import { UserIpWhitelistManager } from "@/lib/features/user-ip-whitelist/UserIpWhitelistManager";
import { UserIpWhitelistServerService } from "@/lib/features/user-ip-whitelist/UserIpWhitelistServerService";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { NextResponse, NextRequest } from "next/server";

export const POST = async (request: NextRequest) => {
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

  const validation = await service.find({
    searchKey: payload.ip_address,
  });

  if (validation.data.length > 0) {
    return NextResponse.json(
      {
        isSuccess: false,
        message:
          "The IP address you provided has already been whitelisted. Please check the IP address and try again.",
        data: [],
      },
      { status: 409 }
    );
  }

  const response = await service.post(payload);

  if (!response.isSuccess) {
    return NextResponse.json(response, { status: 500 });
  }

  return NextResponse.json(response, { status: 201 });
};

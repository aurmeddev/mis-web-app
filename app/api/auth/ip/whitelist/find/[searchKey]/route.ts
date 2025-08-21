import { UserIpWhitelistManager } from "@/lib/features/user-ip-whitelist/UserIpWhitelistManager";
import { UserIpWhitelistServerService } from "@/lib/features/user-ip-whitelist/UserIpWhitelistServerService";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { NextResponse, NextRequest } from "next/server";
export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ searchKey: string }> }
) => {
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

  const searchKey = `${(await params).searchKey}`;
  const service = new UserIpWhitelistManager(
    new UserIpWhitelistServerService()
  );
  const response = await service.find({
    searchKey: searchKey,
  });

  if (!response.isSuccess) {
    return NextResponse.json(response, { status: 500 });
  }

  return NextResponse.json(response, { status: 200 });
};

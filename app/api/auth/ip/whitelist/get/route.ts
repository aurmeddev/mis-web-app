import { UserIpWhitelistManager } from "@/lib/features/users/whitelist-ip/UserIpWhitelistManager";
import { UserIpWhitelistServerService } from "@/lib/features/users/whitelist-ip/UserIpWhitelistServerService";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
import { NextRequest, NextResponse } from "next/server";
export const GET = async (request: NextRequest) => {
  const params = new SearchParamsManager().toObject(
    request.nextUrl.searchParams
  );
  const service = new UserIpWhitelistManager(
    new UserIpWhitelistServerService()
  );
  const response = await service.get(params);

  if (!response.isSuccess) {
    return NextResponse.json(response, { status: 500 });
  }

  if (response.isSuccess && response.data.length === 0) {
    return NextResponse.json(response, { status: 404 });
  }

  return NextResponse.json(response, { status: 200 });
};

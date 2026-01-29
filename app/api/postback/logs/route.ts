// import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { ServerPostbackLogs } from "@/lib/features/postback/logs/export/ServerPostbackLogs";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
import { NextResponse, NextRequest } from "next/server";
export const GET = async (request: NextRequest) => {
  // Check if the user session is valid before processing the request
  // const session = await getSession();
  // if (!session) {
  //   return NextResponse.json(
  //     {
  //       isSuccess: false,
  //       message: "Session expired or invalid",
  //     },
  //     { status: 403 }
  //   );
  // }

  const params = new SearchParamsManager().toObject(
    request.nextUrl.searchParams,
  );

  const logs = new ServerPostbackLogs();
  const { isSuccess, message, data } = await logs.export(params);
  return NextResponse.json(
    {
      isSuccess,
      message,
      data,
    },
    { status: isSuccess ? 200 : 400 },
  );
};

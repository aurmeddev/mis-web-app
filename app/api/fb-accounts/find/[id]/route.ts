import { FbAccountsServerService } from "@/lib/features/fb-accounts/FbAccountsServerService";
import { CryptoServerService } from "@/lib/features/security/cryptography/CryptoServerService";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { UserAccessController } from "@/lib/features/security/user-auth/util/UserAccessController";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
import { NextResponse, NextRequest } from "next/server";
export const POST = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
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

  const { id, user_type_id, navMain } = session.user;
  const isRegularUser = user_type_id === 3;
  const referrer = request.headers.get("referer") || "";
  const searchParams = new SearchParamsManager();
  const { pathname } = searchParams.getUrl(referrer);
  const referrerPathname = pathname;
  const userController = new UserAccessController();
  const hasAccess = userController.verifyUserNavMenuAccess({
    navMain,
    pathname,
  });

  if (!hasAccess) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Invalid access to the resource.",
        data: [],
      },
      { status: 403 }
    );
  }

  const searchKeyword = `${(await params).id}`;
  let payload: any = {};
  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Invalid JSON payload.",
        data: [],
      },
      { status: 400 }
    );
  }

  const requestUrlSearchParams = request.nextUrl.searchParams;
  if (isRegularUser && referrerPathname === "/accounts/fb-accounts") {
    // Fetch only data created by the logged-in regular user
    const decipher = new CryptoServerService();
    const { isSuccess, decryptedData, message } = await decipher.decrypt({
      data: id,
    });

    if (!isSuccess) {
      return NextResponse.json(
        {
          isSuccess,
          message,
          data: [],
        },
        { status: 500 }
      );
    }

    payload.recruiter = decryptedData;
    payload.base_search_keyword = searchKeyword;
    requestUrlSearchParams.set("condition", "all");
  }

  const fbs = new FbAccountsServerService();
  const { isSuccess, data, message } = await fbs.find({
    searchKeyword,
    payload,
    requestUrlSearchParams: requestUrlSearchParams,
  });

  if (!isSuccess) {
    return NextResponse.json(
      {
        isSuccess,
        message,
        data: [],
      },
      { status: 400 }
    );
  }
  return NextResponse.json(
    {
      isSuccess,
      message,
      data: data,
    },
    { status: 200 }
  );
};

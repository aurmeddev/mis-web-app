import { ApProfilesServerService } from "@/lib/features/ap-profiles/ApProfilesServerService";
import { DomainManagerServerService } from "@/lib/features/domains/DomainManagerServerService";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
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

  const searchKeyword = `${(await params).id}`;
  let payload: object = {};
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
  const domain = new DomainManagerServerService();
  const { isSuccess, data, message } = await domain.find({
    searchKeyword,
    payload,
    requestUrlSearchParams: request.nextUrl.searchParams,
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

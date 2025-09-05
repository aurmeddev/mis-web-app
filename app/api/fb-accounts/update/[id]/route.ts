import { FbAccountsServerService } from "@/lib/features/fb-accounts/FbAccountsServerService";
import { UpdateFbAccountsProps } from "@/lib/features/fb-accounts/type/FbAccountsProps";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { NextResponse, NextRequest } from "next/server";
export const PUT = async (
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

  const fbAccountId = `${(await params).id}`;
  let validatePayload: any;
  try {
    validatePayload = await request.json();
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
  const payload: UpdateFbAccountsProps = validatePayload;
  payload.id = Number(fbAccountId);
  const fbs = new FbAccountsServerService();
  const { isSuccess, data, message } = await fbs.update({
    ...payload,
  });

  if (!isSuccess) {
    const status = message.includes("already exists") ? 409 : 400;
    return NextResponse.json(
      {
        isSuccess: false,
        message: message,
        data: [],
      },
      { status: status }
    );
  }

  return NextResponse.json(
    {
      isSuccess: true,
      message: "Data have been updated successfully.",
      data: data,
    },
    { status: 201 }
  );
};

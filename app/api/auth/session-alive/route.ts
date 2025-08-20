import { refreshSession } from "@/lib/security/user-auth/jwt/JwtAuthService";
import { NextResponse } from "next/server";

export const POST = async () => {
  const session = await refreshSession();
  if (!session) {
    return NextResponse.json(
      {
        isSuccess: false,
      },
      { status: 403 }
    );
  }
  return NextResponse.json({ isSuccess: true }, { status: 201 });
};

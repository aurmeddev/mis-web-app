import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { CryptoServerService } from "@/lib/features/security/cryptography/CryptoServerService";
import { CryptoManager } from "@/lib/features/security/cryptography/CryptoManager";
export const POST = async (request: NextRequest) => {
  // const authorization = (await headers()).get("authorization");
  // const token = authorization?.split(" ")[1];
  // const client = new UserAuthManager(new UserAuthServerService());
  // if (!client.isTokenValid(`${token}`)) {
  //   return NextResponse.json(
  //     {
  //       isSuccess: false,
  //       message: "Unauthorized",
  //     },
  //     { status: 401 }
  //   );
  // }
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
  const { data } = await request.json();
  const security = new CryptoManager(new CryptoServerService());
  const response = await security.decrypt({
    data: data,
  });
  if (!response.isSuccess) {
    return NextResponse.json(response, { status: 201 });
  }
  return NextResponse.json(response, { status: 201 });
};

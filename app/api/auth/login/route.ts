import { UserAuthManager } from "@/lib/features/security/user-auth/UserAuthManager";
import { UserAuthServerService } from "@/lib/features/security/user-auth/UserAuthServerService";
import { NextRequest, NextResponse } from "next/server";
import {
  encrypt,
  expirationTime,
} from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { cookies } from "next/headers";
import { UserLoginParams } from "@/lib/features/security/user-auth/type/UserAuthProps";
export const POST = async (request: NextRequest) => {
  const payload: UserLoginParams = await request.json();
  const auth = new UserAuthManager(new UserAuthServerService());
  const response = await auth.login({
    email: payload.email,
    password: payload.password,
    ip_address: payload.ip_address,
  });

  if (!response.isSuccess) {
    const HTTP_STATUS = String(response.message).includes(
      "Something went wrong"
    )
      ? 500
      : 403;
    return NextResponse.json(response, { status: HTTP_STATUS });
  }

  const userInfo = { ...response.data[0] };
  const { password, ...restOfInfo } = userInfo;
  const user = restOfInfo;
  console.log(user);
  const expires = new Date(Date.now() + expirationTime * 1000); // Create the session
  const session = await encrypt({ user, expires });
  (await cookies()).set("session", session, { expires, httpOnly: true }); // Store the session in a cookie
  return NextResponse.json(response, { status: 201 });
};

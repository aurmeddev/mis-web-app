import { NextRequest, NextResponse } from "next/server";
// import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { EmailServerProvider } from "@/lib/features/email/EmailServerProvider";
import { ResendEmailApi } from "@/lib/features/email/ResendEmailApi";
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
  const message = await request.json();
  const resend = new EmailServerProvider(new ResendEmailApi());
  const response = await resend.sendEmail(message);

  if (!response.isSuccess) {
    return NextResponse.json(response, { status: 500 });
  }
  return NextResponse.json(response, { status: 201 });
};

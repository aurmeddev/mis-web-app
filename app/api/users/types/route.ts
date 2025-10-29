// import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { UserServerController } from "@/lib/features/users/manage/UserServerController";
import { NextResponse } from "next/server";
export const GET = async () => {
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

  const teams = new UserServerController();
  const { isSuccess, data, message } = await teams.getUserTypes();

  return NextResponse.json(
    {
      isSuccess,
      message,
      data,
    },
    { status: isSuccess ? 200 : 500 }
  );
};

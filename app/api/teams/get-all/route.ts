// import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { TeamsServerController } from "@/lib/features/teams/TeamsServerController";
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

  const teams = new TeamsServerController();
  const { isSuccess, data, message } = await teams.getAll();

  return NextResponse.json(
    {
      isSuccess,
      message,
      data,
    },
    { status: isSuccess ? 200 : 500 }
  );
};

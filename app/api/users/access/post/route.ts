import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { PostUsersAccessProps } from "@/lib/features/users/access/type/UsersAccessProps";
import { UsersAccessServerService } from "@/lib/features/users/access/UsersAccessServerService";
import { NextResponse, NextRequest } from "next/server";
export const POST = async (request: NextRequest) => {
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

  // // Decrypt the user ID from the session
  // const decipher = new CryptoServerService();
  // const { isSuccess, decryptedData } = await decipher.decrypt({
  //   data: session.user.id,
  // });

  // if (!isSuccess) {
  //   return NextResponse.json(
  //     {
  //       isSuccess,
  //       message: "Data parse error occurred.",
  //     },
  //     { status: 500 }
  //   );
  // }

  // const USER_ID = decryptedData;

  const payload: PostUsersAccessProps = await request.json();
  const access = new UsersAccessServerService();
  const { isSuccess, data, message } = await access.post(payload);
  if (!isSuccess) {
    return NextResponse.json(
      {
        isSuccess,
        message,
        data,
      },
      { status: 201 }
    );
  }

  return NextResponse.json(
    {
      isSuccess: true,
      message: "Data have been submitted successfully.",
      data: data,
    },
    { status: 201 }
  );
};

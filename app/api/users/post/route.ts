// import { CryptoServerService } from "@/lib/features/security/cryptography/CryptoServerService";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { NextResponse, NextRequest } from "next/server";
import { PostUserProps } from "@/lib/features/users/manage/type/UserProps";
import { UserServerController } from "@/lib/features/users/manage/UserServerController";
import { CryptoServerService } from "@/lib/features/security/cryptography/CryptoServerService";
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

  const cipher = new CryptoServerService();
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

  const { email, password, ...rest }: PostUserProps = await request.json();

  if (!rest.full_name) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Full name is required.",
        data: [],
      },
      { status: 400 }
    );
  }

  if (!email) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Email is required.",
        data: [],
      },
      { status: 400 }
    );
  }

  const user = new UserServerController();
  const emailVerificationResult = await user.verifyEmail(email);
  if (!emailVerificationResult.isSuccess) {
    return NextResponse.json(
      {
        isSuccess: emailVerificationResult.isSuccess,
        message: emailVerificationResult.message,
        data: [],
      },
      { status: emailVerificationResult.data[0].code }
    );
  }

  if (!password) {
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Password is required.",
        data: [],
      },
      { status: 400 }
    );
  }
  const { isSuccess, encryptedData } = await cipher.encrypt({
    data: password,
  });

  if (!isSuccess) {
    return NextResponse.json(
      {
        isSuccess,
        message: "Data parse error occurred.",
      },
      { status: 500 }
    );
  }

  const response = await user.post({ ...rest, email, password: encryptedData });
  if (!response.isSuccess) {
    console.error(response.message);
    return NextResponse.json(
      {
        isSuccess: false,
        message: response.message,
        data: [],
      },
      { status: 400 }
    );
  }
  return NextResponse.json(
    {
      isSuccess: true,
      message: response.message,
      data: response.data,
    },
    { status: 201 }
  );
};

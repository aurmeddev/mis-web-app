import { CryptoServerService } from "@/lib/features/security/cryptography/CryptoServerService";
import { TOTP } from "@/lib/features/security/otp-generator/TOTP";
import { GenerateOTPProps } from "@/lib/features/security/otp-generator/type/OtpGeneratorProps";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
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

  const { secret }: GenerateOTPProps = await request.json();
  try {
    const otp = TOTP.generate("totp", secret, null, 30, 6, null, 0);
    return NextResponse.json(
      {
        isSuccess: true,
        message: "OTP generated successfully.",
        data: { otp },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      {
        isSuccess: false,
        message: "Something went wrong! Please try again.",
        data: [],
      },
      { status: 500 }
    );
  }
};

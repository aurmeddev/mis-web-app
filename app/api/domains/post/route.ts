import { CryptoServerService } from "@/lib/features/security/cryptography/CryptoServerService";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { NextResponse, NextRequest } from "next/server";
import { PostDomainManagerServiceProps } from "@/lib/features/domains/type/DomainManagerServiceProps";
import { DomainManagerServerService } from "@/lib/features/domains/DomainManagerServerService";
export const POST = async (request: NextRequest) => {
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

  // // Decrypt the user ID from the session
  const decipher = new CryptoServerService();
  const { isSuccess, decryptedData } = await decipher.decrypt({
    data: session.user.id,
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

  const user = {
    id: decryptedData,
    full_name: session.user.full_name,
    team_name: session.user.team_name,
  };

  const { domain_name }: PostDomainManagerServiceProps = await request.json();
  const domain = new DomainManagerServerService();
  const response = await domain.post({ domain_name, user });

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
      isSuccess: false,
      message: response.message,
      data: response.data,
    },
    { status: 201 }
  );
};

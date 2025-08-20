import { NextRequest, NextResponse } from "next/server";
export const GET = async (request: NextRequest) => {
  const clientIpAddress = request.headers.get("client-ip-address");
  if (!clientIpAddress) {
    return NextResponse.json(
      {
        isSuccess: false,
        data: [],
        message: "Invalid Ip address",
      },
      { status: 500 }
    );
  }
  const response = {
    isSuccess: true,
    data: {
      ip_address: clientIpAddress,
    },
  };

  return NextResponse.json(response, { status: 200 });
};

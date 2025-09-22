import { GeosServerService } from "@/lib/features/geos/GeosServerService";
import { GetAllGeosProps } from "@/lib/features/geos/type/GeosProps";
// import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
import { NextResponse, NextRequest } from "next/server";
export const GET = async (request: NextRequest) => {
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

  const params: GetAllGeosProps = new SearchParamsManager().toObject(
    request.nextUrl.searchParams
  );

  const geosService = new GeosServerService();
  const { isSuccess, data, pagination, message } = await geosService.getAll(
    params
  );

  if (!isSuccess) {
    return NextResponse.json(
      {
        isSuccess,
        message: message,
        pagination: pagination,
        data,
      },
      { status: message.includes("Invalid") ? 400 : 500 }
    );
  }

  return NextResponse.json(
    {
      isSuccess,
      message,
      pagination,
      data,
    },
    { status: 200 }
  );
};

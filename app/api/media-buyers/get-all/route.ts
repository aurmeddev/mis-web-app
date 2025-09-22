import { MediaBuyersServerService } from "@/lib/features/media-buyers/MediaBuyersServerService";
import { GetAllMediaBuyersProps } from "@/lib/features/media-buyers/type/MediaBuyersProps";
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

  const params: GetAllMediaBuyersProps = new SearchParamsManager().toObject(
    request.nextUrl.searchParams
  );

  const mediaBuyersService = new MediaBuyersServerService();
  const { isSuccess, data, pagination, message } =
    await mediaBuyersService.getAll(params);

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

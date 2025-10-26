import { GetAllUserProps } from "@/lib/features/users/manage/type/UserProps";
import { UserServerController } from "@/lib/features/users/manage/UserServerController";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
import { NextResponse, NextRequest } from "next/server";
export const GET = async (request: NextRequest) => {
  const params: GetAllUserProps = new SearchParamsManager().toObject(
    request.nextUrl.searchParams
  );

  const user = new UserServerController();
  const { isSuccess, data, message, pagination } = await user.getAllUsers(
    params
  );

  if (!isSuccess) {
    return NextResponse.json(
      {
        isSuccess,
        message,
        data: [],
      },
      { status: 400 }
    );
  }
  return NextResponse.json(
    {
      isSuccess,
      message,
      pagination,
      data: data,
    },
    { status: 200 }
  );
};

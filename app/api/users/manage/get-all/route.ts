import { GetAllManageUsersProps } from "@/lib/features/users/manage/type/ManageUsersProps";
import { UsersManageServerService } from "@/lib/features/users/manage/UsersManageServerService";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
import { NextResponse, NextRequest } from "next/server";
export const GET = async (request: NextRequest) => {
  const params: GetAllManageUsersProps = new SearchParamsManager().toObject(
    request.nextUrl.searchParams
  );

  const umss = new UsersManageServerService();
  const { isSuccess, data, message, pagination } = await umss.getAllUsers(
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

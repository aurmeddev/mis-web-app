import { GetAllManageUsersProps } from "@/lib/features/users/manage/type/ManageUsersProps";
import { ManageUsersServerService } from "@/lib/features/users/manage/ManageUsersServerService";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
import { NextResponse, NextRequest } from "next/server";
export const GET = async (request: NextRequest) => {
  const params: GetAllManageUsersProps = new SearchParamsManager().toObject(
    request.nextUrl.searchParams
  );

  const umss = new ManageUsersServerService();
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

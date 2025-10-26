import { UserServerController } from "@/lib/features/users/manage/UserServerController";
import { NextResponse, NextRequest } from "next/server";
export const GET = async (request: NextRequest) => {
  const umss = new UserServerController();
  const { isSuccess, data, message } = await umss.getDistinctRecruiters();

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
      data: data,
    },
    { status: 200 }
  );
};

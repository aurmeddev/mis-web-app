import { GetAllApProfilesProps } from "@/lib/features/ap-profiles/type/ApProfilesProps";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
import { NextResponse, NextRequest } from "next/server";
export const GET = async (request: NextRequest) => {
  const params: GetAllApProfilesProps = new SearchParamsManager().toObject(
    request.nextUrl.searchParams
  );

  const { page, limit, recruiter } = params;

  return NextResponse.json(params, { status: 200 });
};

import { InternetBsApiServerService } from "@/lib/features/domains/domain-checker/internetbs-api/InternetBsApiServerService";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
import { NextResponse, NextRequest } from "next/server";
export const GET = async (request: NextRequest) => {
  const { domain }: { domain: string } = new SearchParamsManager().toObject(
    request.nextUrl.searchParams
  );
  const internetbsApi = new InternetBsApiServerService();
  const { isSuccess, data, message } = await internetbsApi.getDomainInfo({
    domain,
  });

  return NextResponse.json(
    {
      isSuccess,
      message,
      data,
    },
    { status: isSuccess ? 200 : 500 }
  );
};

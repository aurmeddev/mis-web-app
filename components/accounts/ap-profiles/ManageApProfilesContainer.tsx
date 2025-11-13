import { Suspense } from "react";
import { TableLoader } from "@/components/shared/skeleton-loader/TableLoader";
import { TableFetch } from "@/components/shared/table/server-fetch/TableFetch";
import { ApProfilesService } from "@/lib/features/ap-profiles/ApProfilesService";
import { ManageApProfilesTableContainer } from "./table/ManageApProfilesTableContainer";

type Props = {
  searchParams: { page: number; limit: number };
  hasAccessToMarketingApiAccessToken: boolean;
};

export async function ManageApProfilesContainer({
  searchParams,
  hasAccessToMarketingApiAccessToken,
}: Props) {
  const profilesService = new ApProfilesService();

  return (
    <div className="min-h-[calc(100dvh-5rem)] p-6 pr-0">
      <div>
        <div className="text-xl">AdsPower Profiles</div>
        <p className="text-sm">
          Manage the assigning of AdsPower profiles to Facebook accounts.
        </p>
      </div>
      <Suspense fallback={<TableLoader />}>
        <TableFetch
          searchParams={searchParams}
          fetchService={(params) => profilesService.getAll(params)}
          Container={ManageApProfilesTableContainer}
          hasAccessToMarketingApiAccessToken={
            hasAccessToMarketingApiAccessToken
          }
        />
      </Suspense>
    </div>
  );
}

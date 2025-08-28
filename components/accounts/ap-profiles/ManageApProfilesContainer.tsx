import { Suspense } from "react";
import { ManageApProfilesTableFetch } from "./table/ManageApProfilesTableFetch";
import { TableLoader } from "@/components/skeleton-loader/TableLoader";

type Props = {
  searchParams: { page: number; limit: number };
};

export async function ManageApProfilesContainer({ searchParams }: Props) {
  return (
    <div className="min-h-[calc(100dvh-5rem)] p-6 pr-0">
      <div>
        <div className="text-xl">Profiles management</div>
        <p className="text-sm">Securely Manage Your AP Login Profiles</p>
      </div>
      <Suspense fallback={<TableLoader />}>
        <ManageApProfilesTableFetch searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

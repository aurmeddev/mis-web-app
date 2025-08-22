import { Suspense } from "react";
import { ManageApProfilesTableFetch } from "./table/ManageApProfilesTableFetch";

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
      <Suspense fallback={<div>Loading...</div>}>
        <ManageApProfilesTableFetch searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

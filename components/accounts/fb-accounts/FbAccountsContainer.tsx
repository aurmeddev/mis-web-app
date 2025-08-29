import { Suspense } from "react";
import { TableLoader } from "@/components/skeleton-loader/TableLoader";
import { FbAccountsTableFetch } from "./table/FbAccountsTableFetch";

type Props = {
  searchParams: { page: number; limit: number };
};

export async function FbAccountsContainer({ searchParams }: Props) {
  return (
    <div className="min-h-[calc(100dvh-7rem)] p-6 pr-0">
      <div>
        <div className="text-xl">FB Accounts Management</div>
        <p className="text-sm">Securely Manage Your Fb Accounts</p>
      </div>
      <Suspense fallback={<TableLoader />}>
        <FbAccountsTableFetch searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

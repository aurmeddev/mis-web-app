import { Suspense } from "react";
import { TableLoader } from "@/components/skeleton-loader/TableLoader";
import { TableFetch } from "@/components/table/server-fetch/TableFetch";
import { FbAccountsService } from "@/lib/features/fb-accounts/FbAccountsService";
import { FbAccountsTableContainer } from "./table/FbAccountsTableContainer";

type Props = {
  searchParams: { page: number; limit: number };
};

export async function FbAccountsContainer({ searchParams }: Props) {
  const fbAccountsService = new FbAccountsService();

  return (
    <div className="min-h-[calc(100dvh-7rem)] p-6 pr-0">
      <div>
        <div className="text-xl">FB Accounts Management</div>
        <p className="text-sm">Securely Manage Your Fb Accounts</p>
      </div>
      <Suspense fallback={<TableLoader />}>
        <TableFetch
          searchParams={searchParams}
          fetchService={(params) => fbAccountsService.getAll(params)}
          Container={FbAccountsTableContainer}
        />
      </Suspense>
    </div>
  );
}

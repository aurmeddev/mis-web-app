import { Suspense } from "react";
import { TableFetch } from "../shared/table/server-fetch/TableFetch";
import { DomainManagerClientService } from "@/lib/features/domains/DomainManagerClientService";
import { DomainsTableContainer } from "./table/DomainsTableContainer";
import { TableLoader } from "../shared/skeleton-loader/TableLoader";

type Props = {
  searchParams: { page: number; limit: number };
};

export async function DomainsContainer({ searchParams }: Props) {
  const domainService = new DomainManagerClientService();
  return (
    <div className="min-h-[calc(100dvh-5rem)] p-6 pr-0">
      <div>
        <div className="text-xl">Domains</div>
        <p className="text-sm">
          Add new domains here to get started with your campaigns.
        </p>
      </div>
      <Suspense fallback={<TableLoader />}>
        <TableFetch
          searchParams={searchParams}
          fetchService={(params) => domainService.getAll(params)}
          Container={DomainsTableContainer}
        />
      </Suspense>
    </div>
  );
}

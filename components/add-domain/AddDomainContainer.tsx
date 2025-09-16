import { AddDomainTableLoader } from "./table/skeleton-loader/AddDomainTableLoader";
import { Suspense } from "react";
import { TableFetch } from "../table/server-fetch/TableFetch";
import { DomainManagerClientService } from "@/lib/features/domains/DomainManagerClientService";
import { AddDomainTableContainer } from "./table/AddDomainTableContainer";

type Props = {
  searchParams: { page: number; limit: number };
};

export async function AddDomainContainer({ searchParams }: Props) {
  const domainService = new DomainManagerClientService();
  return (
    <div className="min-h-[calc(100dvh-5rem)] p-6 pr-0">
      <div>
        <div className="text-xl">Domains</div>
        <p className="text-sm">
          Add new domains here to get started with your campaigns.
        </p>
      </div>
      <Suspense fallback={<AddDomainTableLoader />}>
        <TableFetch
          searchParams={searchParams}
          fetchService={(params) => domainService.getAll(params)}
          Container={AddDomainTableContainer}
        />
      </Suspense>
    </div>
  );
}

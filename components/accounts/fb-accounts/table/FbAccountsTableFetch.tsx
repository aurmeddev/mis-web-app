"use server";

import { FbAccountsTableContainer } from "./FbAccountsTableContainer";
import { FbAccountsService } from "@/lib/features/fb-accounts/FbAccountsService";

type Props = {
  searchParams: { page: number; limit: number };
};

export async function FbAccountsTableFetch({ searchParams }: Props) {
  const fbAccountsService = new FbAccountsService();
  const response = await fbAccountsService.getAll(searchParams);
  return <FbAccountsTableContainer response={response} />;
}

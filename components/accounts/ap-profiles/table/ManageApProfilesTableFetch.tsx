"use server";

import { ApProfilesService } from "@/lib/features/ap-profiles/ApProfilesService";
import { ManageApProfilesTableContainer } from "./ManageApProfilesTableContainer";

type Props = {
  searchParams: { page: number; limit: number };
};

export async function ManageApProfilesTableFetch({ searchParams }: Props) {
  const profilesService = new ApProfilesService();
  const response = await profilesService.getAll(searchParams);
  return <ManageApProfilesTableContainer response={response} />;
}

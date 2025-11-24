import { Suspense } from "react";
import { TableLoader } from "@/components/shared/skeleton-loader/TableLoader";
import { TableFetch } from "@/components/shared/table/server-fetch/TableFetch";
import { FbAccountsService } from "@/lib/features/fb-accounts/FbAccountsService";
import { FbAccountsTableContainer } from "./table/FbAccountsTableContainer";
import { UserClientController } from "@/lib/features/users/manage/UserClientController";
import { GetAllFbAccountsProps } from "@/lib/features/fb-accounts/type/FbAccountsProps";
import { RecruiterOption } from "./FbAccounts.types";

type Props = {
  searchParams: { page: number; limit: number } & GetAllFbAccountsProps;
  isSuperOrAdmin: boolean;
};

export async function FbAccountsContainer({
  searchParams,
  isSuperOrAdmin,
}: Props) {
  const fbAccountsService = new FbAccountsService();
  const manageUsersService = new UserClientController();

  let recruiters: RecruiterOption[] = [
    { id: 0, label: "", totals: 0, value: "" },
  ];
  if (isSuperOrAdmin) {
    const users = await manageUsersService.getDistinctRecruiters();

    recruiters = users.data.map((u) => ({
      id: u.id,
      label: u.display_name,
      totals: u.totals,
      value: u.id,
    }));
  }

  return (
    <div className="min-h-[calc(100dvh-5rem)] p-6 pr-0">
      <div>
        <div className="text-xl">Facebook Accounts</div>
        <p className="text-sm">Manage credentials for Facebook accounts.</p>
      </div>

      <Suspense fallback={<TableLoader />}>
        <TableFetch
          searchParams={searchParams}
          fetchService={(params) => fbAccountsService.getAll(params)}
          Container={FbAccountsTableContainer}
          recruiters={recruiters}
          isSuperOrAdmin={isSuperOrAdmin}
        />
      </Suspense>
    </div>
  );
}

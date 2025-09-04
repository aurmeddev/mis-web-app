import { Suspense } from "react";
import { TableLoader } from "@/components/skeleton-loader/TableLoader";
import { TableFetch } from "@/components/table/server-fetch/TableFetch";
import { FbAccountsService } from "@/lib/features/fb-accounts/FbAccountsService";
import { FbAccountsTableContainer } from "./table/FbAccountsTableContainer";
import { Option } from "./type";
import { UsersManageClientService } from "@/lib/features/users/manage/UsersManageClientService";
import { GetAllFbAccountsProps } from "@/lib/features/fb-accounts/type/FbAccountsProps";

type Props = {
  searchParams: { page: number; limit: number } & GetAllFbAccountsProps;
  isSuperOrAdmin: boolean;
};

export async function FbAccountsContainer({
  searchParams,
  isSuperOrAdmin,
}: Props) {
  const fbAccountsService = new FbAccountsService();
  const manageUsersService = new UsersManageClientService();

  const users = await manageUsersService.getAllUsers({
    user_type: 3,
    team: 3,
  });

  const recruiters: Option[] = users.data.map((u) => ({
    id: u.id,
    label: u.display_name,
    value: u.full_name,
  }));
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
          recruiters={recruiters}
          isSuperOrAdmin={isSuperOrAdmin}
        />
      </Suspense>
    </div>
  );
}

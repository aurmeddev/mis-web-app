import { Suspense } from "react";
import { TableFetch } from "../../shared/table/server-fetch/TableFetch";
import { UserAccessTableContainer } from "./table/UserAccessTableContainer";
import { TableLoader } from "../../shared/skeleton-loader/TableLoader";
import { UserClientController } from "@/lib/features/users/manage/UserClientController";
import { UserAccessProvider } from "@/context/user-access/UserAccessContext";
import {
  MenuSelectOptions,
  UserSelectOptions,
} from "@/app/(pages)/users/access/page";

type Props = {
  brands: any;
  menuSelectOptions: MenuSelectOptions;
  searchParams: { page: number; limit: number };
  userSelectOptions: UserSelectOptions;
};

export async function UserAccessContainer({
  brands,
  menuSelectOptions,
  userSelectOptions,
  searchParams,
}: Props) {
  console.log(brands);
  const userClient = new UserClientController();
  return (
    <UserAccessProvider
      brands={brands}
      menuSelectOptions={menuSelectOptions}
      userSelectOptions={userSelectOptions}
    >
      <div className="min-h-[calc(100dvh-5rem)] p-6 pr-0">
        <div>
          <div className="text-xl">Users</div>
          <p className="text-sm">Manage and control user permissions.</p>
        </div>
        <Suspense fallback={<TableLoader />}>
          <TableFetch
            searchParams={searchParams}
            fetchService={(params) => userClient.getAllUsers(params)}
            Container={UserAccessTableContainer}
          />
        </Suspense>
      </div>
    </UserAccessProvider>
  );
}

import { UserManagementTableLoader } from "./table/skeleton-loader/UserManagementTableLoader";
import { UserManagementTableFetch } from "./table/UserManagementTableFetch";
import { Suspense } from "react";

export async function UserManagementContainer() {
  return (
    <div className="min-h-[calc(100dvh-5rem)] p-6 pr-0">
      <div>
        <div className="text-xl">User management</div>
        <p className="text-sm">
          {"Manage your team's whitelisted IP addresses"}
        </p>
      </div>
      <Suspense fallback={<UserManagementTableLoader />}>
        <UserManagementTableFetch />
      </Suspense>
    </div>
  );
}

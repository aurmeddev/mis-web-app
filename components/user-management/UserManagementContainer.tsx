import { UserManagementTableLoader } from "./table/skeleton-loader/UserManagementTableLoader";
import { UserManagementTableFetch } from "./table/UserManagementTableFetch";
import { Suspense } from "react";

export async function UserManagementContainer() {
  return (
    <div className="min-h-[calc(100dvh-5rem)] p-6 pr-0">
      <div>
        <div className="text-xl">Whitelist IP</div>
        <p className="text-sm">
          {"Manage authorized IP addresses for system access."}
        </p>
      </div>
      <Suspense fallback={<UserManagementTableLoader />}>
        <UserManagementTableFetch />
      </Suspense>
    </div>
  );
}

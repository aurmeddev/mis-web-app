"use server";
import { UserIpWhitelistManager } from "@/lib/features/users/whitelist-ip/UserIpWhitelistManager";
import {
  UserManagementTableContainer,
  WhitelistRecordRaw,
} from "./UserManagementTableContainer";
import { UserIpWhitelistClientService } from "@/lib/features/users/whitelist-ip/UserIpWhitelistClientService";

export async function UserManagementTableFetch() {
  const service = new UserIpWhitelistManager(
    new UserIpWhitelistClientService()
  );
  const { data } = await service.get({
    page: 1,
    limit: 50,
  });

  return (
    <UserManagementTableContainer
      whiteListData={data as WhitelistRecordRaw[]}
    />
  );
}

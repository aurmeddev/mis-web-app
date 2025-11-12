import { NotFound } from "@/components/not-found/not-found";
import { UserManagementContainer } from "@/components/user-management/UserManagementContainer";
import { CryptoUtilsManager } from "@/lib/features/security/cryptography/util/CryptoUtilsManager";
import { CryptoUtilsServerService } from "@/lib/features/security/cryptography/util/CryptoUtilsServerService";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
// import { BrandsClientService } from "@/lib/util/model/brands/BrandsClientService";
// import { BrandsManager } from "@/lib/util/model/brands/BrandsManager";
// import { BrandsUtilsManager } from "@/lib/util/model/brands/util/BrandsUtilsManager";
// import { GeosClientService } from "@/lib/util/model/geos/GeosClientService";
// import { GeosManager } from "@/lib/util/model/geos/GeosManager";
// import { GeosUtilsManager } from "@/lib/util/model/geos/util/GeosUtilsManager";
// import { TeamsClientService } from "@/lib/util/model/teams/TeamsClientService";
// import { TeamsManager } from "@/lib/util/model/teams/TeamsManager";

export default async function Page() {
  const session = await getSession();

  const notFoundObj = {
    msg: "You don't have permission to access this page.",
    title: "403 Forbidden",
  };

  if (!session) return <NotFound param={notFoundObj} />;

  const encryptedTeamId = session.user.id;
  const decipher = new CryptoUtilsManager(new CryptoUtilsServerService());
  const decipheredTeamId = (
    await decipher.cryptoArrayString({ data: encryptedTeamId })
  ).string();

  /*
   *User ID 1 is the Super Admin Account
   *User ID 8 is the Adam Super Admin Account
   */
  const IS_USER_SUPER_ADMIN = decipheredTeamId === "1";
  if (!IS_USER_SUPER_ADMIN) {
    return <NotFound param={notFoundObj} />;
  }
  return <UserManagementContainer />;
}

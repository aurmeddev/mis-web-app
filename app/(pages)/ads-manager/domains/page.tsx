import { DomainsContainer } from "@/components/domains/DomainsContainer";
import { NotFound } from "@/components/not-found/not-found";
import { CryptoUtilsManager } from "@/lib/features/security/cryptography/util/CryptoUtilsManager";
import { CryptoUtilsServerService } from "@/lib/features/security/cryptography/util/CryptoUtilsServerService";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";

export default async function Page({ searchParams }: any) {
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

  const awaitedParams = await searchParams;
  const page = Number(awaitedParams.page) || 1;
  const limit = Number(awaitedParams.limit) || 50;
  const params = {
    page,
    limit,
  };

  /*
   *User ID 1 is the Super Admin Account
   */
  const IS_USER_SUPER_ADMIN = decipheredTeamId === "1";
  if (!IS_USER_SUPER_ADMIN) {
    return <NotFound param={notFoundObj} />;
  }
  return <DomainsContainer searchParams={params} />;
}

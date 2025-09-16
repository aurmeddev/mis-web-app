import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { NotFound } from "@/components/not-found/not-found";
import { ManageApProfilesContainer } from "@/components/accounts/ap-profiles/ManageApProfilesContainer";
import { CryptoClientService } from "@/lib/features/security/cryptography/CryptoClientService";
export default async function Page({ searchParams }: any) {
  const session = await getSession();
  const awaitedParams = await searchParams;

  const notFoundObj = {
    msg: "You don't have permission to access this page.",
    title: "403 Forbidden",
  };
  if (!session) return <NotFound param={notFoundObj} />;

  const page = Number(awaitedParams.page) || 1;
  const limit = Number(awaitedParams.limit) || 10;
  const params = {
    page,
    limit,
  };

  const encryptedUserId = session.user.id;
  const decipher = new CryptoClientService();
  const decipheredUserId = await decipher.decrypt({ data: encryptedUserId });

  const ids = [1, 18, 44, 47, 49, 50, 56];
  //If Mary Anne Tuazon or SUPER ADMIN
  const hasAccessToMarketingApiAccessToken = ids.includes(
    Number(decipheredUserId.decryptedData)
  );

  return (
    <ManageApProfilesContainer
      searchParams={params}
      hasAccessToMarketingApiAccessToken={hasAccessToMarketingApiAccessToken}
    />
  );
}

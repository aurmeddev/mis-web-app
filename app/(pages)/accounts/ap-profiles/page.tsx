import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { NotFound } from "@/components/not-found/not-found";
import { ManageApProfilesContainer } from "@/components/accounts/ap-profiles/ApProfilesContainer";
import { CryptoClientService } from "@/lib/features/security/cryptography/CryptoClientService";
import { BrandsClientService } from "@/lib/features/brands/BrandsClientService";
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

  const ids = [1, 18, 44, 48, 90];
  //If Mary Anne Tuazon or SUPER ADMIN
  const hasAccessToMarketingApiAccessToken = ids.includes(
    Number(decipheredUserId.decryptedData)
  );

  const brandsApi = new BrandsClientService();
  const brands = await brandsApi.getAll({
    status: "active",
  }); // Get all the active brands
  const formattedBrands = brands.data.map((brand) => ({
    id: brand.id,
    label: brand.brand_name,
    value: brand.brand_name,
  }));

  return (
    <ManageApProfilesContainer
      brands={formattedBrands}
      searchParams={params}
      hasAccessToMarketingApiAccessToken={hasAccessToMarketingApiAccessToken}
    />
  );
}

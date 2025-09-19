import { DomainsContainer } from "@/components/ads-manager/domains/DomainsContainer";
import { NotFound } from "@/components/not-found/not-found";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";

export default async function Page({ searchParams }: any) {
  const session = await getSession();

  const notFoundObj = {
    msg: "You don't have permission to access this page.",
    title: "403 Forbidden",
  };

  if (!session) return <NotFound param={notFoundObj} />;

  const awaitedParams = await searchParams;
  const page = Number(awaitedParams.page) || 1;
  const limit = Number(awaitedParams.limit) || 50;
  const params = {
    page,
    limit,
  };

  return <DomainsContainer searchParams={params} />;
}

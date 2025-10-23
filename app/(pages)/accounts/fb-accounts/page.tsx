import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { NotFound } from "@/components/not-found/not-found";
import { FbAccountsContainer } from "@/components/accounts/fb-accounts/FbAccountsContainer";
export default async function Page({ searchParams }: any) {
  const session = await getSession();
  const awaitedParams = await searchParams;

  const notFoundObj = {
    msg: "You don't have permission to access this page.",
    title: "403 Forbidden",
  };
  if (!session) return <NotFound param={notFoundObj} />;
  const isSuperAdmin = session.user.user_type_id === 1;
  // const isAdmin = session.user.user_type_id === 2;
  const isUser = session.user.user_type_id === 3;

  const page = Number(awaitedParams.page) || 1;
  const limit = Number(awaitedParams.limit) || 10;
  const recruiter = isUser ? session.user.id : awaitedParams.recruiter || "";
  const status = awaitedParams.status || "";
  const params = {
    page,
    limit,
    recruiter,
    status,
  };

  return (
    <FbAccountsContainer searchParams={params} isSuperOrAdmin={isSuperAdmin} />
  );
}

import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { NotFound } from "@/components/not-found/not-found";
export default async function Page() {
  const session = await getSession();

  const notFoundObj = {
    msg: "You don't have permission to access this page.",
    title: "403 Forbidden",
  };
  if (!session) return <NotFound param={notFoundObj} />;
  return <>FB Accounts Page</>;
}

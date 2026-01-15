import LogPostbackContainer from "@/components/logs/postback/LogsPostbackContainer";
import { NotFound } from "@/components/not-found/not-found";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";

export default async function Page() {
  const session = await getSession();

  const notFoundObj = {
    msg: "You don't have permission to access this page.",
    title: "403 Forbidden",
  };

  if (!session) return <NotFound param={notFoundObj} />;
  return <LogPostbackContainer />;
}

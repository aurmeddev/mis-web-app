import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { NotFound } from "@/components/not-found/not-found";
import CFGHContainer from "@/components/otp-generator/cf-gh/CFGHContainer";
export default async function Page() {
  const session = await getSession();

  const notFoundObj = {
    msg: "You don't have permission to access this page.",
    title: "403 Forbidden",
  };
  if (!session) return <NotFound param={notFoundObj} />;

  const listOfAccounts = [
    {
      id: 1,
      label: "aurmed111B",
      value: "aurmed111B",
    },
    {
      id: 2,
      label: "aurmed222B",
      value: "aurmed222B",
    },
    {
      id: 3,
      label: "aurmed333B",
      value: "aurmed333B",
    },
    {
      id: 4,
      label: "aurmed444B",
      value: "aurmed444B",
    },
    {
      id: 5,
      label: "aurmed555B",
      value: "aurmed555B",
    },
    {
      id: 6,
      label: "aurmed888",
      value: "aurmed888",
    },
  ];

  return <CFGHContainer accounts={listOfAccounts} />;
}

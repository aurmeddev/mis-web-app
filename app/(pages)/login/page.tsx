import { LoginForm } from "@/components/auth/login-form";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { BlocksIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { LoginPageContainer } from "@/components/auth/login-page-container";
export default async function Page() {
  const session = await getSession();
  if (session) {
    const { navMain } = session.user;

    if (navMain.length === 0) {
      return redirect("/");
    }

    const sortedNavMain = navMain.sort(
      (a: any, b: any) => a.sort_number - b.sort_number
    );

    if (sortedNavMain[0].items.length === 0) {
      return redirect("/");
    }

    const topMainMenu = sortedNavMain[0].items.sort(
      (a: any, b: any) => a.sort_number - b.sort_number
    );
    console.log("topMainMenu", topMainMenu);
    console.log("topMainMenu", topMainMenu);
    const url = topMainMenu[0].url;
    return redirect(url);
  }
  return (
    <LoginPageContainer>
      <div className="flex w-full max-w-sm flex-col gap-6 z-50">
        <div className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BlocksIcon className="size-4" />
          </div>
          <span className="text-white"> Management Information System</span>
        </div>
        <LoginForm />
      </div>
    </LoginPageContainer>
  );
}

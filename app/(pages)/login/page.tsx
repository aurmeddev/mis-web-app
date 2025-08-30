import { LoginForm } from "@/components/auth/login-form";
import { getSession } from "@/lib/features/security/user-auth/jwt/JwtAuthService";
import { GalleryVerticalEnd } from "lucide-react";
import { redirect } from "next/navigation";
import { LoginPageContainer } from "@/components/auth/login-page-container";
export default async function Page() {
  const session = await getSession();
  if (session) {
    const { team_name } = session.user;
    if (team_name === "Traffic Team" || team_name === "Tech Team") {
      return redirect("/otp-generator/facebook");
    }
    if (team_name === "Recruitment Team") {
      return redirect("/accounts/fb-accounts");
    }
    return redirect("/accounts/ap-profiles");
  }
  return (
    <LoginPageContainer>
      <div className="flex w-full max-w-sm flex-col gap-6 z-50">
        <div className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Management Information System
        </div>
        <LoginForm />
      </div>
    </LoginPageContainer>
  );
}

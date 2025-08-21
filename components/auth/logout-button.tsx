import { useState } from "react";
import { UserAuthManager } from "@/lib/features/security/user-auth/UserAuthManager";
import { UserAuthClientService } from "@/lib/features/security/user-auth/UserAuthClientService";
import { appBaseUrl } from "@/lib/base-url/appBaseUrl";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
export const LogoutButton = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const auth = new UserAuthManager(new UserAuthClientService());
  const Logout = async () => {
    if (!navigator.onLine) {
      displayToastMsg(
        false,
        "You're offline! Please check your internet connection."
      );
    } else {
      setIsLoggingOut(true);
      await auth.logout();
      setIsLoggingOut(true);
      window.location.href = `${appBaseUrl}/login`;
    }
  };
  // Display the message using a toast notification.
  const displayToastMsg = (isSuccess: boolean, msg: string) => {
    if (isSuccess) {
      toast.success(msg);
    } else {
      toast.error(msg);
    }
  };

  return (
    <DropdownMenuItem onClick={() => Logout()} disabled={isLoggingOut}>
      <LogOut />
      Log out
    </DropdownMenuItem>
  );
};

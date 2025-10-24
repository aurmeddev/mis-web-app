"use client";
import React, { createContext, useState, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
import { usePathname } from "next/navigation";
import { UserAuthManager } from "@/lib/features/security/user-auth/UserAuthManager";
import { UserAuthClientService } from "@/lib/features/security/user-auth/UserAuthClientService";
import { appBaseUrl } from "@/lib/base-url/appBaseUrl";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const UserActivityContext = createContext({
  isSessionAlive: true,
});

export const UserActivityContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [sessionStatus, setSessionStatus] = useState({ isSessionAlive: true });
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isPathnameNotLoginPage = pathname !== "/login";

  const keepSessionAlive = useDebouncedCallback(async () => {
    if (isPathnameNotLoginPage && isOpen === false) {
      const auth = new UserAuthManager(new UserAuthClientService());
      const { isSuccess } = await auth.keepSessionAlive();
      if (!isSuccess) {
        setIsOpen(true);
        setSessionStatus({ ...sessionStatus, isSessionAlive: false });
      }
    }
  }, 500);

  useEffect(() => {
    window.addEventListener("mousemove", keepSessionAlive);
  }, []);

  return (
    <UserActivityContext.Provider value={sessionStatus}>
      <AlertDialog open={isOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Session Expired</AlertDialogTitle>
            <AlertDialogDescription>
              {`Your session has timed out due to inactivity. Please log in again to continue.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                window.location.href = `${appBaseUrl}/login`;
              }}
            >
              Log In Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {children}
    </UserActivityContext.Provider>
  );
};

export default UserActivityContext;

"use client";
import {
  MenuSelectOptions,
  UserSelectOptions,
} from "@/app/(pages)/users/access/page";
import { SelectOptions } from "@/components/shared/select/type";
import { createContext, useContext } from "react";

type UserAccessContextType = {
  brands: SelectOptions[];
  menuSelectOptions: MenuSelectOptions;
  userSelectOptions: UserSelectOptions;
};

type UserAccessProviderProps = UserAccessContextType &
  React.PropsWithChildren & {
    brands: SelectOptions[];
  };

const UserAccessContext = createContext<UserAccessContextType | undefined>(
  undefined
);

export const UserAccessProvider = ({
  brands,
  menuSelectOptions,
  userSelectOptions,
  children,
}: UserAccessProviderProps) => {
  const contextValue = { brands, menuSelectOptions, userSelectOptions };

  return (
    <UserAccessContext.Provider value={contextValue}>
      {children}
    </UserAccessContext.Provider>
  );
};

export function useUserAccessContext() {
  const context = useContext(UserAccessContext);
  if (!context) {
    throw new Error("useAdChecker must be used inside AdCheckerProvider");
  }
  return context;
}

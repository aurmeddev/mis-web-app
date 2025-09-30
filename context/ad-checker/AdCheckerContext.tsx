"use client";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  Dispatch,
  SetStateAction,
} from "react";

type AdCheckerContextType = {
  isSuperAdmin: boolean;
  setIsSuperAdmin: Dispatch<SetStateAction<boolean>>;
};

const AdCheckerContext = createContext<AdCheckerContextType | undefined>(
  undefined
);

// Provider component
export function AdCheckerProvider({ children }: { children: ReactNode }) {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  return (
    <AdCheckerContext.Provider value={{ isSuperAdmin, setIsSuperAdmin }}>
      {children}
    </AdCheckerContext.Provider>
  );
}

export function useAdCheckerContext() {
  const context = useContext(AdCheckerContext);
  if (!context) {
    throw new Error("useAdChecker must be used inside AdCheckerProvider");
  }
  return context;
}

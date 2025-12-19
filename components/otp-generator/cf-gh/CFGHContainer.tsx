"use client";
import { ICFGHContainer } from "./CFGH.types";
import CFGHOtpCard from "./CFGHOtpCard";
import CFGHSelectAccounts from "./CFGHSelectAccounts";

export default function CFGHContainer({ accounts }: ICFGHContainer) {
  console.log("accounts ", accounts);
  // states
  // default selected acccount is empty ""

  // event handlers
  const handleAccountsChange = (value: string) => {
    console.log("value ", value);
  };

  return (
    <div className="min-h-[calc(100dvh-5rem)] p-6 pr-0">
      <CFGHSelectAccounts
        accounts={accounts}
        onAccountsChange={handleAccountsChange}
        selectedValue={"aurmed222B"}
      />
      <CFGHOtpCard />
    </div>
  );
}

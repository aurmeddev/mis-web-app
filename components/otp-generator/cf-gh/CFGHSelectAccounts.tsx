// accounts - list of accounts
import { GlobalSelect as SelectAccounts } from "@/components/shared/select/GlobalSelect";
import { ICFGHSelectAccounts } from "./CFGH.types";

// onAccountsChange -
export default function CFGHSelectAccounts({
  accounts,
  onAccountsChange,
  selectedValue,
}: ICFGHSelectAccounts) {
  // local component logic

  return (
    <SelectAccounts
      options={accounts}
      onSelectedValue={(value) => onAccountsChange(value)}
      placeholder="Select Account"
      value={selectedValue}
    />
  );
}

import { SelectOptions } from "@/components/shared/select/type";

interface ICFGHContainer {
  accounts: SelectOptions[];
}

interface ICFGHSelectAccounts {
  accounts: SelectOptions[];
  onAccountsChange: (value: string) => void;
  selectedValue: string;
}

interface ICFGHOtpCard {}

export type { ICFGHContainer, ICFGHSelectAccounts, ICFGHOtpCard };

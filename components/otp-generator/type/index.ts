import { Profile } from "@/components/accounts/ap-profiles/type";
import { ApiResponseProps } from "@/database/dbConnection";

type GeneratorBaseProps = {
  otp: string;
  generateOTP: (calledAgain: boolean) => void;
};

export type SearchQuery = {
  isSearching: boolean;
  result: ApiResponseProps;
  query: string;
  selectedResult: Record<string, any> | null;
};

export type GeneratorSearchResultsProps = {
  result: ApiResponseProps;
  handleSelectItem: (item: Profile) => void;
};

export type GeneratorCardProps = GeneratorBaseProps & {
  selectedResult: Record<string, any>;
};

export type GeneratorCardIdentifier = {
  identifier: "otp" | "username" | "password";
};

export type GeneratorCountdownProps = GeneratorBaseProps;

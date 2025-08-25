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
  handleSelectItem: (item: Record<string, any>) => void;
};

export type GeneratorCardProps = GeneratorBaseProps & {
  selectedResult: Record<string, any>;
};

export type GeneratorCountdownProps = GeneratorBaseProps;

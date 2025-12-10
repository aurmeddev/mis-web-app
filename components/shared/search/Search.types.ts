import { ApiResponseProps } from "@/database/query";

export type SearchQuery = {
  isSearching: boolean;
  result: ApiResponseProps;
  query: string;
  selectedResult: Record<string, any> | null;
};

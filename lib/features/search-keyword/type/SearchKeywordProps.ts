type BaseSearchKeywordProps = {
  searchKeyword: string;
  method: "find-one" | "find-many";
  dynamicSearchPayload?: object; // Search multiple fields or columns
};

type SearchKeywordServiceProps = Omit<BaseSearchKeywordProps, "method"> & {
  requestUrlSearchParams: any;
  databaseTableName: string;
  staticSearchField: string;
  limitNoOfResults?: number; // Optional limit for the number of results, default is 3
};
export type { BaseSearchKeywordProps, SearchKeywordServiceProps };

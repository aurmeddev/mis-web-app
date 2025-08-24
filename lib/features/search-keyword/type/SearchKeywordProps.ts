type BaseSearchKeywordProps = {
  searchKeyword: string;
  method: "find-one" | "find-any"; // find-one: Exact match, find-any: Partial match (= / LIKE)
  condition?: "all" | "at-least-one"; // all: all conditions must be met (AND), at-least-one: at least one condition must be met (OR)
  dynamicSearchPayload?: object; // Search multiple fields or columns
};

type SearchKeywordServiceProps = Omit<
  BaseSearchKeywordProps,
  "method" | "condition"
> & {
  requestUrlSearchParams: any;
  databaseTableName: string;
  staticSearchField: string;
  limitNoOfResults?: number; // Optional limit for the number of results, default is 3
};
export type { BaseSearchKeywordProps, SearchKeywordServiceProps };

type BaseSearchKeywordProps = {
  searchKeyword: string;
  method: "find-one" | "find-many";
  dynamicSearchPayload?: object; // Search multiple fields or columns
};
export type { BaseSearchKeywordProps };

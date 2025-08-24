import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
import {
  BaseSearchKeywordProps,
  SearchKeywordServiceProps,
} from "./type/SearchKeywordProps";
import { ObjectUtils } from "@/lib/utils/object/ObjectUtils";
import { MySqlUtils } from "@/lib/utils/mysql/MySqlUtils";

type MethodProps = Omit<
  BaseSearchKeywordProps,
  "searchKeyword" | "dynamicSearchPayload"
>;
export class SearchKeywordService {
  search(params: SearchKeywordServiceProps) {
    const {
      searchKeyword,
      requestUrlSearchParams,
      dynamicSearchPayload,
      databaseTableName,
      staticSearchField,
      limitNoOfResults,
    } = params;

    const LIMIT = limitNoOfResults ?? 3;
    const searchParamsUtils: MethodProps = new SearchParamsManager().toObject(
      requestUrlSearchParams
    );
    const { method, condition } = searchParamsUtils;
    const objUtil = new ObjectUtils();
    const isValidJsonPayload = objUtil.isValidObject(
      dynamicSearchPayload ?? {}
    );
    if (
      isValidJsonPayload &&
      Object.keys(dynamicSearchPayload ?? {}).length > 1
    ) {
      if (condition !== "all" && condition !== "at-least-one") {
        return {
          isSuccess: false,
          message:
            'Invalid condition value. It must be either "all" or "at-least-one".',
          queryString: "",
          values: [],
        };
      }
    }
    if (method !== "find-one" && method !== "find-any") {
      return {
        isSuccess: false,
        message:
          'Invalid method value. It must be either "find-one" or "find-any".',
        queryString: "",
        values: [],
      };
    }

    let column = dynamicSearchPayload;
    if (!isValidJsonPayload) {
      column = {
        [staticSearchField]: searchKeyword,
      };
    }

    const mysqlUtils = new MySqlUtils();
    const { columns, values } = mysqlUtils.generateFindQuery({
      column: column,
      operator: method === "find-one" ? "equals" : "like", // Default to "like" if not provided
      condition: condition || "all",
    });

    const queryString = `SELECT * FROM ${databaseTableName} WHERE ${columns} LIMIT ${LIMIT}`;
    console.log(queryString);
    console.log(values);
    return {
      isSuccess: true,
      message: "Query generated successfully.",
      queryString: queryString,
      values: values,
    };
  }
}

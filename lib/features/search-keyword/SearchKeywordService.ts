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
    const methodParam: MethodProps = new SearchParamsManager().toObject(
      requestUrlSearchParams
    );
    const { method } = methodParam;
    const objUtil = new ObjectUtils();
    const isValidPayload = objUtil.isValidObject(dynamicSearchPayload ?? {});

    let column = dynamicSearchPayload;
    if (!isValidPayload) {
      column = {
        [staticSearchField]: searchKeyword,
      };
    }

    const mysqlUtils = new MySqlUtils();
    const { columns, values } = mysqlUtils.generateFindQuery({
      column: column,
      operator: method === "find-one" ? "equals" : "like", // Default to "like" if not provided
    });

    const queryString = `SELECT * FROM ${databaseTableName} WHERE ${columns} LIMIT ${LIMIT}`;
    console.log(queryString);
    console.log(values);
    return {
      queryString: queryString,
      values: values,
    };
  }
}

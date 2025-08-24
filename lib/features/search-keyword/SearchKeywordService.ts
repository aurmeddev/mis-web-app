import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
import {
  BaseSearchKeywordProps,
  SearchKeywordServiceProps,
} from "./type/SearchKeywordProps";
import { ObjectUtils } from "@/lib/utils/object/ObjectUtils";
import {
  GenerateFindQueryProps,
  MySqlUtils,
} from "@/lib/utils/mysql/MySqlUtils";

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
    const isJsonPayloadValid = objUtil.isValidObject(
      dynamicSearchPayload ?? {}
    );
    const containsMultipleParams =
      Object.keys(dynamicSearchPayload ?? {}).length > 1;

    if (method !== "find-one" && method !== "find-any") {
      return {
        isSuccess: false,
        message:
          'Invalid method value. It must be either "find-one" or "find-any".',
        queryString: "",
        values: [],
      };
    }

    let generateFindQueryParams: GenerateFindQueryProps;
    if (isJsonPayloadValid) {
      if (containsMultipleParams) {
        if (condition !== "all" && condition !== "at-least-one") {
          return {
            isSuccess: false,
            message:
              'Invalid condition value. It must be either "all" or "at-least-one".',
            queryString: "",
            values: [],
          };
        }
        generateFindQueryParams = {
          column: dynamicSearchPayload,
          operator: method === "find-one" ? "equals" : "like", // Assign logial operator based on method type
          condition: condition,
        };
      } else {
        if (searchKeyword !== "validation") {
          const dynamicKey = Object.keys(dynamicSearchPayload ?? {})[0];
          generateFindQueryParams = {
            column: { [dynamicKey]: searchKeyword },
            operator: method === "find-one" ? "equals" : "like", // Assign logial operator based on method type
          };
        } else {
          generateFindQueryParams = {
            column: dynamicSearchPayload,
            operator: method === "find-one" ? "equals" : "like", // Assign logial operator based on method type
          };
        }
      }
    } else {
      generateFindQueryParams = {
        column: {
          [staticSearchField]: searchKeyword,
        },
        operator: method === "find-one" ? "equals" : "like", // Assign logial operator based on method type
      };
    }

    // console.log(generateFindQueryParams);
    const mysqlUtils = new MySqlUtils();
    const { columns, values } = mysqlUtils.generateFindQuery(
      generateFindQueryParams
    );

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

import { BaseSearchKeywordProps } from "@/lib/features/search-keyword/type/SearchKeywordProps";
import { NumberUtils } from "@/lib/utils/number/NumberUtils";

export type PaginationRowIdsProps = {
  page: number;
  limit: number;
  size: number;
};
type ConditionProps = Omit<
  BaseSearchKeywordProps,
  "searchKeyword" | "dynamicSearchPayload" | "method"
>;
export type GenerateFindQueryProps = ConditionProps & {
  column: any;
  operator: "equals" | "like"; // If operator is undefined, "LIKE" is the default value
};
export class MySqlUtils {
  generateInsertQuery(params: any) {
    const keys = Object.keys(params);
    const newKeys = validateMySQLSpecialColumnSyntax(keys);
    const columns = newKeys.join(",");
    const stringArrayValue = Object.values(params).map(String);
    const result = {
      columns: `(${columns})`,
      values: stringArrayValue,
      questionMarksValue: `VALUES (${generateQuestionMark(stringArrayValue)})`,
    };
    return result;
  }

  generateUpdateQuery(params: any) {
    const { id, ...rest } = params;
    const primaryKey = id.toString();
    const keys = validateMySQLSpecialColumnSyntax(Object.keys(rest));
    const appendQuestionMarks = [];
    for (let index = 0; index < keys.length; index++) {
      appendQuestionMarks.push(`${keys[index]}=?`);
    }
    const columns =
      appendQuestionMarks.length > 1
        ? appendQuestionMarks.join(",")
        : appendQuestionMarks;
    const stringArrayValue = Object.values(rest).map(String);
    stringArrayValue.push(primaryKey);
    const result = {
      columns: `SET ${columns}`,
      whereClause: `WHERE id=?`,
      values: stringArrayValue,
    };
    return result;
  }

  generateSelectQuery = (params: {
    data: Record<string, any>; // Data to be used in the query
    matchingOperator?: string; // If operator is undefined, "=" is the default value
    logicalOperator?: string; // Logical operator for combining conditions (AND/OR)
  }) => {
    const { matchingOperator, ...rest } = params;
    const queryWhereClause: string[] = [];
    const queryValues: string[] = [];
    const logicalOperator = rest.logicalOperator || "AND"; // Default to AND if not provided
    for (const [key, value] of Object.entries(rest.data)) {
      if (typeof value === "string" && value.includes(",")) {
        // Check if the value is a string and contains a comma
        const splitValue = value.split(",");
        const questionMarks: string[] = [];
        for (let index = 0; index < splitValue.length; index++) {
          questionMarks.push("?");
          queryValues.push(splitValue[index]);
        }
        const preparedString = `${key} IN(${questionMarks.join(",")})`;
        queryWhereClause.push(preparedString);
      } else if (key === "date") {
        for (const [key, dateValue] of Object.entries(
          value as Record<string, any>
        )) {
          queryValues.push(dateValue);
        }
        // Check if the key is date_from or date_to
        const datePreparedString = `${key} BETWEEN ? AND ?`;
        queryWhereClause.push(datePreparedString);
      } else {
        // For other keys, use the default equality check
        const preparedString = `${key}${
          matchingOperator && String(matchingOperator).toUpperCase() === "LIKE"
            ? " " + matchingOperator + " ?"
            : "=?"
        }`;
        queryWhereClause.push(preparedString);
        queryValues.push(value as string);
      }
    }

    // Join the queryWhereClause array into a single string
    const queryWhereClauseString = ` WHERE ${
      queryWhereClause.length > 1
        ? queryWhereClause.join(` ${logicalOperator} `)
        : queryWhereClause
    }`;
    return {
      queryWhereClauseString,
      queryValues: queryValues.map((value) => String(value)), // Convert all values to string
    };
  };

  generateFindQuery(params: GenerateFindQueryProps) {
    const { operator, column, condition } = params;
    const logicalOperator = condition || "all"; // Default to AND if not provided
    const keys = Object.keys(column);
    const appendQuestionMarks = [];
    for (let index = 0; index < keys.length; index++) {
      appendQuestionMarks.push(
        `${keys[index]}${
          operator && String(operator).toUpperCase() === "LIKE"
            ? " " + operator + " ?"
            : "=?"
        }`
      );
    }
    const columns =
      appendQuestionMarks.length > 1
        ? logicalOperator === "all"
          ? appendQuestionMarks.join(" AND ")
          : appendQuestionMarks.join(" OR ")
        : appendQuestionMarks;
    const arrayValues = Object.values(column);
    const stringArray = arrayValues.map((prop: any) => {
      return operator && String(operator).toUpperCase() === "LIKE"
        ? `%${String(prop)}%`
        : String(prop);
    });

    const result = {
      columns: `${columns}`,
      values: stringArray,
    };
    return result;
  }

  generatePaginationQuery(params: any) {
    const numberUtil = new NumberUtils();
    const isPageParamValid = numberUtil.isNumber(params.page);
    const isLimitParamValid = numberUtil.isNumber(params.limit);
    const page = isPageParamValid ? Number(params.page) : 1;
    const NoOfDataPerPage = isLimitParamValid ? Number(params.limit) : 50;
    const offset = (Number(page) - 1) * NoOfDataPerPage;
    const limitOffsetQueryString = `LIMIT ${NoOfDataPerPage} OFFSET ${offset}`;
    return {
      page: page,
      limit: NoOfDataPerPage,
      offset: offset,
      limitOffsetQueryString: limitOffsetQueryString,
    };
  }

  generateRowIds(pagination: PaginationRowIdsProps) {
    const { page, limit, size } = pagination;
    const startRowId = (page - 1) * limit + 1;
    const rowId = [];
    for (let i = startRowId; i < startRowId + size; i++) {
      rowId.push(i);
    }
    return rowId;
  }
}

const generateQuestionMark = (array: string[]) => {
  const questionMarks = [];
  for (let i = 0; i < array.length; i++) {
    questionMarks.push("?");
  }
  return questionMarks.join(",");
};

const validateMySQLSpecialColumnSyntax = (keys: string[]) => {
  const newKeys = [];
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index];
    if (key === "lead") {
      newKeys.push("`lead`"); // MySQL syntax for lead column
    } else {
      newKeys.push(key);
    }
  }

  return newKeys;
};

import { ApiResponseProps, query } from "@/database/dbConnection";
import {
  FindFbAccountsProps,
  UpdateFbAccountsProps,
} from "./type/FbAccountsProps";
import { SearchKeywordService } from "../search-keyword/SearchKeywordService";
import { CryptoServerService } from "../security/cryptography/CryptoServerService";
import { DatetimeUtils } from "@/lib/utils/date/DatetimeUtils";
import { ObjectUtils } from "@/lib/utils/object/ObjectUtils";
import { MySqlUtils } from "@/lib/utils/mysql/MySqlUtils";

type FindApProfilesServerServiceProps = Omit<
  FindFbAccountsProps,
  "method" | "condition" | "dynamicSearchPayload"
> & {
  payload: object;
  requestUrlSearchParams: any;
};
export class FbAccountsServerService {
  async find(
    params: FindApProfilesServerServiceProps
  ): Promise<ApiResponseProps> {
    const { searchKeyword, payload, requestUrlSearchParams } = params;

    let validPayload: object = {};
    try {
      validPayload = payload;
    } catch (error) {
      return {
        isSuccess: false,
        message: "Invalid JSON payload.",
        data: [],
      };
    }

    const searchApi = new SearchKeywordService();
    const { queryString, values, isSuccess, message } = searchApi.search({
      searchKeyword,
      requestUrlSearchParams: requestUrlSearchParams,
      dynamicSearchPayload: validPayload,
      databaseTableName: "v_FbAccountsV2",
      staticSearchField: "base_search_keyword",
    });

    if (!isSuccess) {
      return {
        isSuccess,
        message,
        data: [],
      };
    }

    // Execute the query to find data in the database
    try {
      const response: any = await query({
        query: queryString,
        values: values,
      });

      if (response.length === 0) {
        return {
          isSuccess: true,
          message: "No data found.",
          data: [],
        };
      }

      const cipher = new CryptoServerService();
      const dateUtils = new DatetimeUtils();
      const formattedResponse = await Promise.all(
        response.map(async (item: any) => {
          const {
            created_at,
            is_active, // Exclude base_search_keyword in the response.
            fb_owner_account_created,
            base_search_keyword, // Exclude base_search_keyword in the response. It's for searching purpose only
            recruiter, // Exclude recruiter in the response. It's for filtering purpose only
            ...rest
          } = item;

          const { app_2fa_key, app_secret_key, marketing_api_access_token } =
            rest;
          const sensitiveData: any = {
            app_2fa_key,
            app_secret_key,
            marketing_api_access_token,
          };

          for (const prop of Object.keys(sensitiveData)) {
            const value = sensitiveData[prop];
            if (value) {
              const { isSuccess, encryptedData, message } =
                await cipher.encrypt({
                  data: value, // Enrypt
                });
              rest[prop] = isSuccess ? encryptedData : message;
            }
          }

          if (rest.ap_profile?.created_at) {
            rest.ap_profile.created_at = dateUtils.formatDateTime(
              dateUtils.convertToUTC8(rest.ap_profile.created_at)
            );
          }

          return {
            ...rest,
            description: rest.ap_profile?.profile_name
              ? `Currently assigned to ${rest.ap_profile.profile_name}`
              : rest.status,
            fb_owner_account_created: fb_owner_account_created
              ? dateUtils.formatDateOnly(
                  dateUtils.convertToUTC8(fb_owner_account_created)
                )
              : null,
            created_at: dateUtils.formatDateTime(
              dateUtils.convertToUTC8(created_at)
            ),
          };
        })
      );

      return {
        isSuccess: true,
        message: "Data fetched successfully.",
        data: formattedResponse,
      };
    } catch (error: any) {
      console.error(error);
      return {
        isSuccess: false,
        message: "Something went wrong! Please try again.",
        data: [],
      };
    }
  }

  async update(params: UpdateFbAccountsProps): Promise<ApiResponseProps> {
    const data = { ...params };
    if (params.no_of_friends !== undefined) {
      data.no_of_friends =
        typeof params.no_of_friends === "number"
          ? Number(params.no_of_friends)
          : 0;
    }
    const fbAccountId = data.id;
    const objUtil = new ObjectUtils();
    const validationPostQueryParams = objUtil.removeInvalidKeys({
      data: {
        fb_owner_name: data.fb_owner_name,
        contact_no: data.contact_no || "",
        email_address: data.email_address || "",
        username: data.username,
      },
      isStrictMode: true,
    });

    if (objUtil.isValidObject(validationPostQueryParams)) {
      // Validate if the fb account already exists
      const fbs = new FbAccountsServerService();
      const customSearchParams = new URLSearchParams();
      customSearchParams.set("method", "find-one");
      customSearchParams.set("condition", "all");
      const validationResponse = await fbs.find({
        searchKeyword: "validation",
        requestUrlSearchParams: customSearchParams,
        payload: validationPostQueryParams,
      });

      if (!validationResponse.isSuccess) {
        return {
          isSuccess: false,
          message: "Validation error occurred.",
          data: [],
        };
      }
      const doesApProfileExist = validationResponse.data.length > 0;
      if (doesApProfileExist) {
        return {
          isSuccess: false,
          message:
            "The FB account information you provided already exists. Please check and try again.",
          data: [],
        };
      }
    }

    const { id, ...payload } = objUtil.removeInvalidKeys({
      data: data,
      isStrictMode: false,
    });
    const mysqlUtils = new MySqlUtils();
    const { columns, values, whereClause } = mysqlUtils.generateUpdateQuery({
      ...payload,
      id: fbAccountId,
    });
    const queryString = `UPDATE Fb_Accounts ${columns} ${whereClause}`;
    console.log(queryString);
    console.log(values);

    // Execute the query to insert data into the database
    try {
      await query({
        query: queryString,
        values: values,
      });

      // Encrypt the app_2fa_key
      const response: any = {};
      if (data.app_2fa_key) {
        const cipher = new CryptoServerService();
        const { isSuccess, encryptedData, message } = await cipher.encrypt({
          data: data.app_2fa_key,
        });
        response.app_2fa_key = isSuccess ? encryptedData : message;
      } else {
        response.app_2fa_key = "";
      }

      return {
        isSuccess: true,
        message: "Data have been updated successfully.",
        data: [response],
      };
    } catch (error: any) {
      console.error(error);
      return {
        isSuccess: false,
        message: "Something went wrong! Please try again.",
        data: [],
      };
    }
  }
}

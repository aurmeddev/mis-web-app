import { ApiResponseProps, query } from "@/database/dbConnection";
import { FindApProfilesProps } from "./type/ApProfilesProps";
import { SearchKeywordService } from "../search-keyword/SearchKeywordService";
import { DatetimeUtils } from "@/lib/utils/date/DatetimeUtils";
import { CryptoServerService } from "../security/cryptography/CryptoServerService";

type FindApProfilesServerServiceProps = Omit<
  FindApProfilesProps,
  "method" | "condition" | "dynamicSearchPayload"
> & {
  payload: object;
  requestUrlSearchParams: any;
};
export class ApProfilesServerService {
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
      databaseTableName: "v_ApProfiles",
      staticSearchField: "profile_name",
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
          const { created_at, is_active, created_by, ap_created_by, ...rest } =
            item;

          if (rest.fb_account) {
            const { app_2fa_key, app_secret_key, marketing_api_access_token } =
              rest.fb_account;
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
                rest.fb_account[prop] = isSuccess ? encryptedData : message;
              }
            }
          }

          return {
            ...rest,
            description: rest.fb_account?.fb_owner_name
              ? `Currently assigned to ${rest.fb_account.fb_owner_name}`
              : rest.status,
            created_by: ap_created_by,
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
}

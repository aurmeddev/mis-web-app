import { ApiResponseProps, query } from "@/database/dbConnection";
import { FindFbAccountsProps } from "./type/FbAccountsProps";
import { SearchKeywordService } from "../search-keyword/SearchKeywordService";
import { CryptoServerService } from "../security/cryptography/CryptoServerService";
import { DatetimeUtils } from "@/lib/utils/date/DatetimeUtils";

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

          if (rest.app_2fa_key) {
            const { isSuccess, encryptedData, message } = await cipher.encrypt({
              data: rest.app_2fa_key, // Enrypt app_2fa_key
            });
            rest.app_2fa_key = isSuccess ? encryptedData : message;
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
}

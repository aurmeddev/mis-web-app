import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
import { GraphFacebookApiConfig } from "./config/GraphFacebookApiConfig";
import {
  BaseFacebookAdsManagerServiceProps,
  MarketingApiAccessTokenConfigProps,
} from "./type/FacebookMarketingApiProps";
import { ApiResponseProps } from "@/database/dbConnection";
import { DomainManagerServerService } from "../domains/DomainManagerServerService";

type ResultProps = {
  data: any[];
};
export class FacebookAdsManagerServerService {
  private graphFbApiConfig = new GraphFacebookApiConfig();
  private requestOptions: RequestInit = {
    method: "GET",
    headers: {
      "Content-type": "application/json",
    },
    cache: "no-store",
  };
  private maximumDailyBudget = 500;
  constructor(private config: MarketingApiAccessTokenConfigProps) {
    this.config = config;
  }
  async getAdAccounts(params: { fields?: string }): Promise<ApiResponseProps> {
    const defaultFields = `id,name,account_status,disable_reason`;
    const searchParams: any = {
      access_token: this.config.access_token,
      use_account_attribution_setting: true,
      // filtering: `[{field: "name",operator:"CONTAIN", value: "WZYC-FT-June 23-3"}]`,
    };

    if (!params.fields) {
      searchParams.fields = defaultFields;
    }
    const searchQueryParams = new SearchParamsManager().append(searchParams);
    const response = await fetch(
      `${this.graphFbApiConfig.baseUrl}/${this.graphFbApiConfig.version}/me/adaccounts${searchQueryParams}`,
      this.requestOptions
    );

    if (!response.ok) {
      const { error } = await response.json();
      console.error(error);
      return {
        isSuccess: false,
        message: error.message,
        data: [],
      };
    }

    const result: ResultProps = await response.json();
    const formattedResult = result.data.map((prop) => {
      return {
        ...prop,
        account_status: getAdAccountStatus[prop.account_status] || "UNKNOWN",
        disable_reason:
          getAdAccountDisableReason[prop.disable_reason] || "UNKNOWN",
      };
    });

    return {
      isSuccess: true,
      message:
        result.data.length > 0
          ? "Data fetched successfully."
          : "No data found.",
      data: formattedResult || [],
    };
  }

  async getAdInsights(
    params: Omit<
      BaseFacebookAdsManagerServiceProps,
      "access_token" | "use_account_attribution_setting"
    > & {
      id: string;
    }
  ): Promise<ApiResponseProps> {
    const { id, ...restOfParams } = params;

    let fields = [];
    if (restOfParams.level === "campaign") {
      const campaignFields = ["campaign_id", "campaign_name"];
      fields = [...campaignFields, ...baseFieldsInsights];
    } else if (restOfParams.level === "adset") {
      const adsetFields = ["adset_id", "adset_name", "campaign_id"];
      fields = [...adsetFields, ...baseFieldsInsights];
    } else {
      const adFields = ["ad_id", "ad_name", "adset_id"];
      fields = [...adFields, ...baseFieldsInsights];
    }

    const searchParams: any = {
      access_token: this.config.access_token,
      ...restOfParams,
      use_account_attribution_setting: true,
    };

    if (!restOfParams.fields) {
      searchParams.fields = fields.join(); // Convert array to string
    }

    const searchQueryParams = new SearchParamsManager().append(searchParams);
    const response = await fetch(
      `${this.graphFbApiConfig.baseUrl}/${this.graphFbApiConfig.version}/${id}/insights${searchQueryParams}`,
      this.requestOptions
    );

    if (!response.ok) {
      const { error } = await response.json();
      console.error(error);
      return {
        isSuccess: false,
        message: error.message,
        data: [],
      };
    }

    const result: ResultProps = await response.json();
    return {
      isSuccess: true,
      message:
        result.data.length > 0
          ? "Data fetched successfully."
          : "No data found.",
      data: result.data || [],
    };
  }

  async adChecker(
    params: Omit<
      BaseFacebookAdsManagerServiceProps,
      "access_token" | "use_account_attribution_setting" | "level"
    > & {
      id: string;
    }
  ) {
    const { id, time_ranges, ...restOfParams } = params;
    const defaultFields = `name,adsets{name,daily_budget,targeting{geo_locations{countries}},insights.time_ranges(${time_ranges}){spend},adcreatives{object_story_spec{video_data}}}`;

    const searchParams: any = {
      access_token: this.config.access_token,
      ...restOfParams,
      use_account_attribution_setting: true,
    };

    if (!restOfParams.fields) {
      searchParams.fields = defaultFields;
    }

    const searchQueryParams = new SearchParamsManager().append(searchParams);
    const response = await fetch(
      `${this.graphFbApiConfig.baseUrl}/${this.graphFbApiConfig.version}/${id}/campaigns${searchQueryParams}`,
      this.requestOptions
    );

    if (!response.ok) {
      const { error } = await response.json();
      console.error(error);
      return {
        isSuccess: false,
        message: error.message,
        data: [],
      };
    }

    const result: ResultProps = await response.json();
    const formattedResult = await Promise.all(
      result.data.map(async (prop) => {
        const { id, adsets, name, ...restOfProps } = prop;
        const hasAdsets = adsets?.data.length > 0;
        if (hasAdsets) {
          restOfProps.adsets = await Promise.all(
            adsets.data.map(async (adset: any) => {
              const { adcreatives, insights, targeting, ...restOfAdsets } =
                adset;
              const hasAdcreatives = adcreatives?.data.length > 0;
              if (hasAdcreatives) {
                const domains: string[] = [];
                const adcreativesResult = await Promise.all(
                  adcreatives.data.map(async (adcreative: any) => {
                    const { id, object_story_spec } = adcreative;
                    const video_data = object_story_spec?.video_data;
                    const hasLink = video_data?.call_to_action?.value?.link;
                    if (hasLink) {
                      const link: string =
                        video_data?.call_to_action?.value?.link;
                      const domainName =
                        new SearchParamsManager().getDomainNameFromUrl(link);
                      domains.push(String(domainName));
                    }
                    return video_data;
                  })
                );

                const newSetOfDomains = [...new Set(domains)]; // Removes duplicate values
                const domainValidationResult = await validateDomain({
                  domain: newSetOfDomains,
                });
                restOfAdsets.domain = domainValidationResult.domain;
                restOfAdsets.ad_checker_status_details = {
                  ...restOfAdsets.ad_checker_status_details,
                  domain_status: domainValidationResult.message,
                };
                restOfAdsets.adcreatives = adcreativesResult.filter(
                  (creative) => creative !== undefined
                );
              } else {
                restOfAdsets.adcreatives = [];
              }

              const convertedToUsd = restOfAdsets.daily_budget / 100;
              const targeting_countries = targeting?.geo_locations?.countries;
              const remarks = targeting?.geo_locations?.countries.includes("US")
                ? "Suspicious geo-location targeting."
                : "OK";

              const statuses: Record<string, any> = {
                targeting_countries_status: remarks,
              };

              statuses.daily_budget_status =
                convertedToUsd > this.maximumDailyBudget
                  ? `Exceeded ($${this.maximumDailyBudget}) daily budget amount.`
                  : "OK";

              restOfAdsets.ad_checker_status_details = {
                ...restOfAdsets.ad_checker_status_details,
                ...statuses,
              };

              const flag_message = Object.values(
                restOfAdsets.ad_checker_status_details
              ).filter((value) => value !== "OK");

              const ad_checker_summary = Object.values(
                restOfAdsets.ad_checker_status_details
              ).every((value) => value === "OK")
                ? { code: 200, message: ["Everything is OK!"] } // Everything is OK!
                : { code: 500, message: flag_message }; // Flag suspicious
              return {
                ...restOfAdsets,
                targeting_countries: targeting_countries,
                spend:
                  insights?.data.length > 0
                    ? Number(insights.data[0].spend)
                    : 0,
                daily_budget: `${
                  convertedToUsd
                    ? `${convertedToUsd.toFixed(2)}`
                    : `daily budget error`
                }`,
                ad_checker_summary: ad_checker_summary,
              };
            })
          );
        } else {
          restOfProps.adsets = [
            {
              name,
              ad_checker_summary: {
                code: 404,
                message: ["No adsets found."],
              },
            },
          ]; // Assign the campaign name, if adsets is empty
        }

        return {
          ...restOfProps,
        };
      })
    );
    return {
      isSuccess: true,
      message:
        result.data.length > 0
          ? "Data fetched successfully."
          : "No data found.",
      data: formattedResult || [],
    };
  }

  async accessTokenDebugger() {
    const searchParams = {
      input_token: this.config.access_token,
      access_token: this.config.access_token,
    };
    const searchQueryParams = new SearchParamsManager().append(searchParams);
    const response = await fetch(
      `${this.graphFbApiConfig.baseUrl}/debug_token${searchQueryParams}`,
      this.requestOptions
    );

    if (!response.ok) {
      const { error } = await response.json();
      console.error(error);
      return {
        isSuccess: false,
        message: error.message,
        data: [],
      };
    }

    return {
      isSuccess: true,
      message: "Access token is valid.",
      data: [],
    };
  }
}

const baseFieldsInsights = [
  "account_currency",
  "reach",
  "impressions",
  "cpm",
  "spend",
  "frequency",
  "actions",
  "cost_per_inline_link_click",
  "cpc",
  "ctr",
  "inline_link_click_ctr",
];

const getAdAccountStatus: Record<number, string> = {
  1: "ACTIVE",
  2: "DISABLED",
  3: "UNSETTLED",
  7: "PENDING_RISK_REVIEW",
  8: "PENDING_SETTLEMENT",
  9: "IN_GRACE_PERIOD",
  100: "PENDING_CLOSURE",
  101: "CLOSED",
  201: "ANY_ACTIVE",
  202: "ANY_CLOSED",
};

const getAdAccountDisableReason: Record<number, string> = {
  0: "NONE",
  1: "ADS_INTEGRITY_POLICY",
  2: "ADS_IP_REVIEW",
  3: "RISK_PAYMENT",
  4: "GRAY_ACCOUNT_SHUT_DOWN",
  5: "ADS_AFC_REVIEW",
  6: "BUSINESS_INTEGRITY_RAR",
  7: "PERMANENT_CLOSE",
  8: "UNUSED_RESELLER_ACCOUNT",
  9: "UNUSED_ACCOUNT",
  10: "UMBRELLA_AD_ACCOUNT",
  11: "BUSINESS_MANAGER_INTEGRITY_POLICY",
  12: "MISREPRESENTED_AD_ACCOUNT",
  13: "AOAB_DESHARE_LEGAL_ENTITY",
  14: "CTX_THREAD_REVIEW",
  15: "COMPROMISED_AD_ACCOUNT",
};

const validateDomain = async ({ domain }: { domain: string[] }) => {
  const api = new DomainManagerServerService();
  const customSearchParams = new URLSearchParams();
  customSearchParams.set("method", "find-one");
  const result = await Promise.all(
    domain.map(async (value) => {
      const { isSuccess, data, message } = await api.find({
        searchKeyword: "validation",
        requestUrlSearchParams: customSearchParams,
        payload: { domain_name: value },
      });

      if (!isSuccess) {
        console.log(message);
        return {
          name: value,
          status: "Server error occured.",
        };
      }

      return {
        name: value,
        status: data.length > 0 ? "OK" : "Not found",
      };
    })
  );

  const domain_status_result = Object.values(result)
    .filter((prop) => prop.status !== "OK")
    .map((prop) => prop.name);

  const message =
    domain_status_result.length > 0
      ? formatDomainsForSentence(domain_status_result.join(","))
      : "OK";

  return { domain: result, message: message };
};

function formatDomainsForSentence(domainsString: string) {
  const domains = domainsString.split(",");
  if (domains.length === 1) {
    return `The ${domains[0]} was not found in the interbetbs account.`;
  }
  const allButLast = domains.slice(0, -1); // Get all domains except the last one.
  const lastDomain = domains[domains.length - 1]; // Get the very last domain.
  const formattedList = allButLast.join(", ");
  return `The ${formattedList} and ${lastDomain} were not found in the interbetbs account.`;
}

// import { createHmac } from "crypto";
// type GenerateAppSecretProofProps = {
//   access_token: string;
//   app_secret_key: string;
// };
// export function generateAppSecretProof({
//   access_token,
//   app_secret_key,
// }: GenerateAppSecretProofProps) {
//   // Validate input to ensure they are strings.
//   if (typeof access_token !== "string" || typeof app_secret_key !== "string") {
//     console.error("Error: Both accessToken and appSecret must be strings.");
//     return "";
//   }
//   // Create an HMAC instance using the 'sha256' algorithm and the app secret as the key.
//   const hmac = createHmac("sha256", app_secret_key);
//   // Update the HMAC with the access token data.
//   hmac.update(access_token);
//   // Get the final HMAC hash and return it in hexadecimal format.
//   return hmac.digest("hex");
// }

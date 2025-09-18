import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
import { GraphFacebookApiConfig } from "./config/GraphFacebookApiConfig";
import {
  BaseFacebookAdsManagerServiceProps,
  MarketingApiAccessTokenConfigProps,
} from "./type/FacebookMarketingApiProps";
import { ApiResponseProps } from "@/database/dbConnection";
import { DomainManagerServerService } from "../../domains/DomainManagerServerService";

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
  async getAdAccounts(): Promise<ApiResponseProps> {
    const searchParams: any = {
      access_token: this.config.access_token,
      use_account_attribution_setting: true,
      fields: `id,name,account_status,disable_reason`,
      // filtering: `[{field: "name",operator:"CONTAIN", value: "WZYC-FT-June 23-3"}]`,
    };

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

  async adInsights(
    params: Omit<BaseFacebookAdsManagerServiceProps, "access_token"> & {
      id: string;
    }
  ) {
    const { id, time_ranges, filtering } = params;
    const insightFields = baseInsightsFields.join(",");
    const searchParams: any = {
      access_token: this.config.access_token,
      fields: `name,daily_budget,adsets{name,daily_budget,effective_status,targeting{geo_locations{countries}},insights.time_ranges(${time_ranges}){${insightFields}}}`,
      use_account_attribution_setting: true,
    };

    if (isFilteringValid(filtering || [])) {
      searchParams.filtering = JSON.stringify(filtering);
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
        const { id, adsets, name, daily_budget, ...restOfProps } = prop;
        const campaignDailyBudget = daily_budget;
        const hasAdsets = adsets?.data.length > 0;
        if (hasAdsets) {
          restOfProps.adsets = await Promise.all(
            adsets.data.map(async (adset: any) => {
              const { id, insights, targeting, ...restOfAdsets } = adset;
              restOfAdsets.effective_status =
                restOfAdsets.effective_status.includes("PAUSED")
                  ? "PAUSED"
                  : restOfAdsets.effective_status;
              const convertedToUsd = restOfAdsets.daily_budget
                ? restOfAdsets.daily_budget / 100
                : campaignDailyBudget / 100; // Use the campaign's daily budget as a fallback if the ad set's daily budget is not available.
              const targeting_countries = targeting?.geo_locations?.countries;

              return {
                ...restOfAdsets,
                ...formatInsightsFields(insights),
                targeting_countries: targeting_countries,
                daily_budget: `${
                  convertedToUsd
                    ? `${convertedToUsd.toFixed(2)}`
                    : `daily budget error`
                }`,
              };
            })
          );
        } else {
          restOfProps.adsets = [
            {
              name, // Assign the campaign name, if adsets is empty
              ad_checker_summary: {
                code: 404,
                message: ["No adsets found."],
              },
            },
          ];
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

  async adChecker(
    params: Omit<
      BaseFacebookAdsManagerServiceProps,
      "access_token" | "filtering"
    > & {
      id: string;
    }
  ) {
    const { id, time_ranges } = params;
    const searchParams: any = {
      access_token: this.config.access_token,
      use_account_attribution_setting: true,
      fields: `name,daily_budget,adsets{name,daily_budget,effective_status,targeting{geo_locations{countries}},insights.time_ranges(${time_ranges}){spend},adcreatives{object_story_spec{video_data}}}`,
    };

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
        const { id, adsets, name, daily_budget, ...restOfProps } = prop;
        const campaignDailyBudget = daily_budget;
        const hasAdsets = adsets?.data.length > 0;
        if (hasAdsets) {
          restOfProps.adsets = await Promise.all(
            adsets.data.map(async (adset: any) => {
              const { adcreatives, insights, targeting, ...restOfAdsets } =
                adset;
              restOfAdsets.effective_status =
                restOfAdsets.effective_status.includes("PAUSED")
                  ? "PAUSED"
                  : restOfAdsets.effective_status;
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

              const convertedToUsd = restOfAdsets.daily_budget
                ? restOfAdsets.daily_budget / 100
                : campaignDailyBudget / 100; // Use the campaign's daily budget as a fallback if the ad set's daily budget is not available.
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
      const { status } = getAccessTokenStatus(error.message);
      return {
        isSuccess: false,
        message: error.message,
        data: [{ status }],
      };
    }

    return {
      isSuccess: true,
      message: "Access token is valid.",
      data: [],
    };
  }
}

const baseInsightsFields = [
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

export const formatCampaigns = (data: any) => {
  const result = data.map((adAccount: any) => {
    const { campaigns, ...rest } = adAccount;
    const hasCampaigns = campaigns?.length > 0;
    if (hasCampaigns) {
      const formattedCampaign = campaigns
        .map((campaign: any) => {
          const { adsets } = campaign;
          const hasAdsets = adsets?.length > 0;
          if (hasAdsets) {
            return {
              ...adsets,
            };
          }
        })
        .filter(Boolean); // Exclude null or undefined values
      // Use flatMap to iterate and flatten the nested objects.
      const flattenedCampaigns = formattedCampaign.flatMap((item: any) => {
        return Object.values(item);
      });
      rest.campaigns = flattenedCampaigns;
    } else {
      rest.campaigns = [];
    }
    return { ...rest };
  });

  // Spread Ad account
  const shallowCopyForSpreadingAdAccount = [...result];
  const adAccountHasNoAdsets: any = [];
  const spreadAdAccount: any = [];
  shallowCopyForSpreadingAdAccount.forEach((adAccount: any) => {
    const { campaigns, id, name, account_status, disable_reason } = adAccount;
    const hasCampaigns = campaigns?.length > 0;
    if (hasCampaigns) {
      const newCampaign = campaigns.map((camp: any) => {
        return {
          ...camp,
          ad_account_id: id,
          ad_account_name: name,
          account_status,
          disable_reason,
        };
      });
      spreadAdAccount.push(...newCampaign);
    } else {
      adAccountHasNoAdsets.push({
        ad_account_id: id,
        ad_account_name: name,
        account_status,
        disable_reason,
        ad_checker_summary: {
          code: 404,
          message: ["No adsets found."],
        },
      });
    }
  });

  return [...spreadAdAccount, ...adAccountHasNoAdsets];
};
const formatInsightsFields = (insights: any) => {
  const defaultInsightFields = {
    reach: 0,
    impressions: 0,
    cpm: 0,
    spend: 0,
    frequency: 0,
    cost_per_inline_link_click: 0,
    cpc: 0,
    ctr: 0,
    inline_link_click_ctr: 0,
  };
  const events = {
    lead: 0,
    purchase: 0,
    link_click: 0,
  };
  if (insights?.data.length > 0) {
    const { actions, date_start, date_stop, ...rest } = { ...insights.data[0] };

    if (actions?.length > 0) {
      const result = actions.filter(
        (key: any) =>
          key.action_type === "lead" ||
          key.action_type === "purchase" ||
          key.action_type === "link_click"
      );

      if (result.length > 0) {
        for (const item of result) {
          if (events.hasOwnProperty(item.action_type)) {
            const value = Number(item.value) || 0;
            events[item.action_type as keyof typeof events] = value;
          }
        }
      }
    }

    for (const key in rest) {
      if (defaultInsightFields.hasOwnProperty(key)) {
        const value = Number(rest[key]) || 0;
        defaultInsightFields[key as keyof typeof defaultInsightFields] = value;
      }
    }

    return { account_currency: "USD", ...defaultInsightFields, ...events };
  }

  return {
    ...defaultInsightFields,
    ...events,
  };
};

const validateDomain = async ({ domain }: { domain: string[] }) => {
  const api = new DomainManagerServerService();
  const customSearchParams = new URLSearchParams();
  customSearchParams.set("method", "find-one");
  customSearchParams.set("condition", "all");
  const result = await Promise.all(
    domain.map(async (value) => {
      const { isSuccess, data, message } = await api.find({
        searchKeyword: "validation",
        requestUrlSearchParams: customSearchParams,
        payload: { domain_name: value, status: "active" },
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

const formatDomainsForSentence = (domainsString: string) => {
  const domains = domainsString.split(",");
  if (domains.length === 1) {
    return `The ${domains[0]} was not found in the internetbs account.`;
  }
  const allButLast = domains.slice(0, -1); // Get all domains except the last one.
  const lastDomain = domains[domains.length - 1]; // Get the very last domain.
  const formattedList = allButLast.join(", ");
  return `The ${formattedList} and ${lastDomain} were not found in the internetbs account.`;
};

const getAccessTokenStatus = (error: string) => {
  // A lookup table for error messages.
  const ERROR_MESSAGES = {
    "log in": {
      status: "Fb Account Logout",
    },
    "not authorized application": {
      status: "Unauthorized access",
    },
    "Session has expired": {
      status: "Expired access token",
    },
    "Object with ID 'me' does not exist": {
      status: "Facebook Developer's Account error",
    },
  };

  // Find the first matching error message in the lookup table.
  const matchingMessage = Object.keys(ERROR_MESSAGES).find((key) =>
    error.includes(key)
  );

  // Get the message from the lookup table, or use a default one.
  const { status } = matchingMessage
    ? ERROR_MESSAGES[matchingMessage as keyof typeof ERROR_MESSAGES]
    : {
        status: "Invalid access token",
      };

  // Return the final formatted message object.
  return {
    status,
  };
};

export const isFilteringValid = (
  filtering: { field: string; operator: "CONTAIN"; value: string }[]
) => {
  if (!Array.isArray(filtering)) {
    return false;
  }

  for (const item of filtering) {
    if (typeof item !== "object" || item === null) {
      return false;
    }

    // Use a quick check for the required properties and their types.
    if (
      typeof item.field !== "string" ||
      item.field.trim() === "" ||
      item.operator !== "CONTAIN" ||
      typeof item.value !== "string" ||
      item.value.trim() === ""
    ) {
      return false;
    }
  }

  return true;
};

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

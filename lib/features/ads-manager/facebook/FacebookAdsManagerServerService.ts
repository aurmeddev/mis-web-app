import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
import { GraphFacebookApiConfig } from "./config/GraphFacebookApiConfig";
import {
  BaseFacebookAdsManagerServiceProps,
  DeleteAdRuleProps,
  MarketingApiAccessTokenConfigProps,
  UpdateDeliveryStatusProps,
} from "./type/FacebookMarketingApiProps";
import { ApiResponseProps } from "@/database/query";
import { DomainManagerServerService } from "../../domains/DomainManagerServerService";
import { format, parseISO } from "date-fns";

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
  private companyTargetingCountries = ["MY", "SG", "ID", "KH", "HK", "TH"];
  private maximumDailyBudget = 500;
  constructor(private config: MarketingApiAccessTokenConfigProps) {
    this.config = config;
  }

  getFallbackResponseData(params: {
    code: 404 | 500;
    status: "Facebook server error" | "No traffic data" | "No adsets found";
    adSummaryLabel: string;
    props?: Record<string, any>;
  }) {
    const { code, status, adSummaryLabel, props } = params;
    const customProps = props || {};
    return [
      {
        adsets: [
          {
            name: null,
            [adSummaryLabel]: {
              code: code,
              message: [status],
            },
            ...customProps,
          },
        ],
      },
    ];
  }
  formatInsightsFields(insights: any) {
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
    if (insights?.data?.length > 0) {
      const { actions, date_start, date_stop, ...rest } = {
        ...insights.data[0],
      };

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
          defaultInsightFields[key as keyof typeof defaultInsightFields] =
            value;
        }
      }

      return { account_currency: "USD", ...defaultInsightFields, ...events };
    }

    return {
      account_currency: "USD",
      ...defaultInsightFields,
      ...events,
    };
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
      console.log("error ad account level");
      console.log("access_token", this.config.access_token);
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
        data: this.getFallbackResponseData({
          code: 500,
          status: "Facebook server error",
          adSummaryLabel: "ad_insights_summary",
          props: { ...this.formatInsightsFields([]) },
        }),
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
              const { id, insights, targeting, ...restOfAdsetsProps } = adset;
              restOfAdsetsProps.effective_status =
                restOfAdsetsProps.effective_status.includes("PAUSED")
                  ? "PAUSED"
                  : restOfAdsetsProps.effective_status;
              const convertedToUsd = restOfAdsetsProps.daily_budget
                ? restOfAdsetsProps.daily_budget / 100
                : campaignDailyBudget / 100; // Use the campaign's daily budget as a fallback if the ad set's daily budget is not available.
              const targeting_countries = targeting?.geo_locations?.countries;
              const hasTrafficData = insights?.data?.length > 0;

              return {
                ...restOfAdsetsProps,
                ...this.formatInsightsFields(insights),
                targeting_countries: targeting_countries,
                daily_budget: `${
                  convertedToUsd
                    ? `${convertedToUsd.toFixed(2)}`
                    : `daily budget error`
                }`,
                ad_insights_summary: {
                  code: hasTrafficData ? 200 : 404,
                  message: hasTrafficData
                    ? ["Everything is OK!"]
                    : ["No traffic data"],
                },
              };
            })
          );
        } else {
          restOfProps.adsets = this.getFallbackResponseData({
            code: 404,
            status: "No adsets found",
            adSummaryLabel: "ad_insights_summary",
            props: { ...this.formatInsightsFields([]) },
          });
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
      data:
        formattedResult.length > 0
          ? formattedResult
          : this.getFallbackResponseData({
              code: 404,
              status: "No traffic data",
              adSummaryLabel: "ad_insights_summary",
              props: { ...this.formatInsightsFields([]) },
            }),
    };
  }

  async adChecker(
    params: Omit<
      BaseFacebookAdsManagerServiceProps,
      "access_token" | "filtering"
    > & {
      id: string;
      account_status: string;
    }
  ) {
    const { id, time_ranges, account_status } = params;
    const searchParams: any = {
      access_token: this.config.access_token,
      use_account_attribution_setting: true,
      fields: `id,name,daily_budget,effective_status,adsets{id,name,created_time,updated_time,daily_budget,effective_status,targeting{geo_locations{countries}},insights.time_ranges(${time_ranges}){spend},adcreatives{object_story_spec{video_data}}}`,
    };

    const searchQueryParams = new SearchParamsManager().append(searchParams);
    const response = await fetch(
      `${this.graphFbApiConfig.baseUrl}/${this.graphFbApiConfig.version}/${id}/campaigns${searchQueryParams}`,
      this.requestOptions
    );

    if (!response.ok) {
      const { error } = await response.json();
      console.log("error campaign level");
      console.log("access_token", this.config.access_token);
      console.log("ad account id", id);
      console.error(error);
      return {
        isSuccess: false,
        message: error.message,
        data: this.getFallbackResponseData({
          code: 500,
          status: "Facebook server error",
          adSummaryLabel: "ad_checker_summary",
        }),
      };
    }

    const isAdAccountStatusActive = account_status === "ACTIVE";
    const result: ResultProps = await response.json();
    const formattedResult = await Promise.all(
      result.data.map(async (prop) => {
        const { id, adsets, name, daily_budget, ...restOfCampaignProps } = prop;
        const campaign_id = id;
        const campaignDailyBudget = daily_budget;
        const hasAdsets = adsets?.data.length > 0;
        if (hasAdsets) {
          let isCampaignDeliveryStatusPaused = false;
          const currentCampaignDeliveryStatus =
            restOfCampaignProps.effective_status === "ACTIVE" ||
            restOfCampaignProps.effective_status === "IN_PROCESS" ||
            restOfCampaignProps.effective_status === "PENDING_REVIEW" ||
            restOfCampaignProps.effective_status === "WITH_ISSUES";
          restOfCampaignProps.adsets = await Promise.all(
            adsets.data.map(async (adset: any) => {
              const {
                created_time,
                updated_time,
                adcreatives,
                insights,
                targeting,
                ...restOfAdsetsProps
              } = adset;
              restOfAdsetsProps.campaign_id = campaign_id; // Assign campaign_id to each adset
              restOfAdsetsProps.effective_status =
                restOfAdsetsProps.effective_status.includes("PAUSED")
                  ? "PAUSED"
                  : restOfAdsetsProps.effective_status;
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
                restOfAdsetsProps.domain = domainValidationResult.domain;
                restOfAdsetsProps.ad_checker_status_details = {
                  ...restOfAdsetsProps.ad_checker_status_details,
                  domain_status: domainValidationResult.message,
                };
                restOfAdsetsProps.adcreatives = adcreativesResult.filter(
                  (creative) => creative !== undefined
                );
              } else {
                restOfAdsetsProps.adcreatives = [];
              }

              const convertedToUsd = restOfAdsetsProps.daily_budget
                ? restOfAdsetsProps.daily_budget / 100
                : campaignDailyBudget / 100; // Use the campaign's daily budget as a fallback if the ad set's daily budget is not available.
              const targeting_countries = targeting?.geo_locations?.countries;
              const remarks = validateTargetingCountries({
                targetingCountries: targeting_countries || [],
                reference: this.companyTargetingCountries,
              });

              const statuses: Record<string, any> = {
                targeting_countries_status: remarks,
              };

              statuses.daily_budget_status =
                convertedToUsd > this.maximumDailyBudget
                  ? `Exceeded ($${this.maximumDailyBudget}) daily budget amount.`
                  : String(convertedToUsd).includes("9") && convertedToUsd > 100
                  ? "Suspicious daily budget amount."
                  : "OK";

              restOfAdsetsProps.ad_checker_status_details = {
                ...restOfAdsetsProps.ad_checker_status_details,
                ...statuses,
              };

              const found_suspicious = Object.values(
                restOfAdsetsProps.ad_checker_status_details
              ).filter((value) => value !== "OK");

              if (
                isAdAccountStatusActive &&
                !isCampaignDeliveryStatusPaused &&
                currentCampaignDeliveryStatus &&
                found_suspicious.length > 0
              ) {
                // Pause the campaign if any suspicious activity is found.
                // Only pause if the campaign is currently ACTIVE/IN_PROCESS/PENDING_REVIEW/WITH_ISSUES
                const { isSuccess, message } = await this.updateDeliveryStatus({
                  id: campaign_id,
                  status: "PAUSED",
                });
                if (isSuccess) {
                  restOfCampaignProps.effective_status = "PAUSED";
                  restOfAdsetsProps.effective_status = "PAUSED";
                  isCampaignDeliveryStatusPaused = true;
                  restOfAdsetsProps.update_campaign_delivery_status = message;
                } else {
                  restOfAdsetsProps.update_campaign_delivery_status = message;
                }
              }

              const ad_checker_summary = Object.values(
                restOfAdsetsProps.ad_checker_status_details
              ).every((value) => value === "OK")
                ? { code: 200, message: ["Everything is OK!"] } // Everything is OK!
                : { code: 451, message: found_suspicious }; // 451: Unavailable For Legal Reasons

              const created_at = formatDate(created_time) || "";
              const updated_at = formatDate(updated_time) || "";
              return {
                ...restOfAdsetsProps,
                created_at: created_at,
                updated_at: updated_at,
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
          restOfCampaignProps.adsets = this.getFallbackResponseData({
            code: 404,
            status: "No adsets found",
            adSummaryLabel: "ad_checker_summary",
            props: { name },
          }); // Assign the campaign name, if adsets is empty
        }

        return {
          ...restOfCampaignProps,
        };
      })
    );

    return {
      isSuccess: true,
      message:
        result.data.length > 0
          ? "Data fetched successfully."
          : "No data found.",
      data:
        formattedResult.length > 0
          ? formattedResult
          : this.getFallbackResponseData({
              code: 404,
              status: "No traffic data",
              adSummaryLabel: "ad_checker_summary",
              props: { name: null },
            }),
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

  async updateDeliveryStatus(params: UpdateDeliveryStatusProps) {
    const { id, status } = params;
    const searchParams: any = {
      access_token: this.config.access_token,
      status,
    };
    const searchQueryParams = new SearchParamsManager().append(searchParams);
    const response = await fetch(
      `${this.graphFbApiConfig.baseUrl}/${this.graphFbApiConfig.version}/${id}${searchQueryParams}`,
      { method: "POST" }
    );

    if (!response.ok) {
      const { error } = await response.json();
      console.log("update delivery status error");
      console.log("access_token", this.config.access_token);
      console.log("id", id);
      console.error(error);
      return {
        isSuccess: false,
        message: "Facebook server error",
        data: [],
      };
    }

    const { success } = await response.json();

    if (!success) {
      console.log("update delivery status - false");
      console.log("access_token", this.config.access_token);
      console.log("id", id);
      return {
        isSuccess: false,
        message: "Facebook server error",
        data: [],
      };
    }

    console.log("update delivery status - true");
    console.log("access_token", this.config.access_token);
    console.log("id", id);
    return {
      isSuccess: true,
      message: "Delivery status updated",
      data: [],
    };
  }

  async getAdRules(params: { id: string }) {
    const { id } = params;
    const searchParams: any = {
      access_token: this.config.access_token,
      fields: `id,name`, // status,evaluation_spec,execution_spec,schedule_spec
    };
    const searchQueryParams = new SearchParamsManager().append(searchParams);
    const response = await fetch(
      `${this.graphFbApiConfig.baseUrl}/${this.graphFbApiConfig.version}/${id}/adrules_library${searchQueryParams}`,
      this.requestOptions
    );

    if (!response.ok) {
      const { error } = await response.json();
      console.log("get ad rules status error");
      console.log("access_token", this.config.access_token);
      console.log("id", id);
      console.error(error);
      return {
        isSuccess: false,
        message: "Facebook server error",
        data: [],
      };
    }

    const { data } = await response.json();
    if (data?.length === 0) {
      console.log("No ad rules found");
      console.log("access_token", this.config.access_token);
      console.log("id", id);
      return {
        isSuccess: true,
        message: "No ad rules found",
        data: [],
      };
    }

    console.log("get ad rules status - true");
    console.log("access_token", this.config.access_token);
    console.log("id", id);
    return {
      isSuccess: true,
      message: "Get ad rules success",
      data: data,
    };
  }

  async deleteAdRule(params: DeleteAdRuleProps) {
    const { id, status } = params;
    const searchParams: any = {
      access_token: this.config.access_token,
      status,
    };
    const searchQueryParams = new SearchParamsManager().append(searchParams);
    const response = await fetch(
      `${this.graphFbApiConfig.baseUrl}/${this.graphFbApiConfig.version}/${id}${searchQueryParams}`,
      { method: "POST" }
    );

    if (!response.ok) {
      const { error } = await response.json();
      if (error?.message.includes("Permissions error")) {
        return {
          isSuccess: false,
          message: "No permission to delete ad rule",
          data: [],
        };
      }
      console.log("delete ad rule status error");
      console.log("access_token", this.config.access_token);
      console.log("id", id);
      console.error(error);
      return {
        isSuccess: false,
        message: "Facebook server error",
        data: [],
      };
    }

    const { success } = await response.json();

    if (!success) {
      console.log("delete ad rule status - false");
      console.log("access_token", this.config.access_token);
      console.log("id", id);
      return {
        isSuccess: false,
        message: "Facebook server error",
        data: [],
      };
    }

    console.log("delete ad rule status - true");
    console.log("access_token", this.config.access_token);
    console.log("id", id);
    return {
      isSuccess: true,
      message: "Ad rule deleted",
      data: [],
    };
  }

  async processDeleteAdRules(params: { id: string }) {
    const { id } = params;
    const results = [];
    const getAdRulesResult = await this.getAdRules({ id });
    if (!getAdRulesResult.isSuccess) {
      return {
        delete_ad_rules_status: getAdRulesResult.message,
      };
    }

    if (getAdRulesResult.data.length === 0) {
      return {
        delete_ad_rules_status: getAdRulesResult.message,
      };
    }

    for (const rule of getAdRulesResult.data) {
      console.log("Deleting ad rule:", rule.name);
      const deleteResult = await this.deleteAdRule({
        id: rule.id,
        status: "DELETED",
      });
      results.push(deleteResult.message);
    }

    const newSetOfResults = [...new Set(results)]; // Removes duplicate values
    if (newSetOfResults.length === 0) {
      return {
        delete_ad_rules_status: "No ad rules found",
      };
    }
    const hasError = newSetOfResults.includes("Facebook server error");
    const hasNoPermissionError = newSetOfResults.includes(
      "No permission to delete ad rule"
    );
    return {
      delete_ad_rules_status: hasError
        ? "Facebook server error"
        : hasNoPermissionError
        ? "No permission to delete ad rule"
        : "Ad rule deleted",
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
    const { campaigns, id, name, account_status, disable_reason, ...rest } =
      adAccount;
    const hasCampaigns = campaigns?.length > 0;
    if (hasCampaigns) {
      const newCampaign = campaigns.map((camp: any) => {
        return {
          ...rest,
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
        ...rest,
        ad_account_id: id,
        ad_account_name: name,
        account_status,
        disable_reason,
        ad_checker_summary: {
          code: 404,
          message: ["No adsets found"],
        },
      });
    }
  });

  return [...spreadAdAccount, ...adAccountHasNoAdsets];
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

const validateTargetingCountries = (params: {
  targetingCountries: string[];
  reference: string[];
}) => {
  if (params.targetingCountries.length === 0) {
    return "No geo-location targeting.";
  }

  const { targetingCountries, reference } = params;
  const adCheckerSummary = [];
  for (const country of targetingCountries) {
    if (!reference.includes(country)) {
      adCheckerSummary.push({
        country: country,
        status: "Suspicious geo-location targeting.",
      });
    } else {
      adCheckerSummary.push({ country: country, status: "OK" });
    }
  }

  const result = adCheckerSummary.filter((value) => value.status !== "OK");
  const suspicious = result.length > 0;
  return suspicious ? "Suspicious geo-location targeting." : "OK";
};

const formatDate = (dateString: any) => {
  // Step 1: Parse the ISO 8601 string into a JavaScript Date object.
  // parseISO is designed to handle this exact format, including the timezone offset.
  const date = parseISO(dateString);

  // Step 2: Format the Date object to the desired 'yyyy-MM-dd' string.
  // The 'MM' represents the month with a leading zero.
  return format(date, "yyyy-MM-dd");
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

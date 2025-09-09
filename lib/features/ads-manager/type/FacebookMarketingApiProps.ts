type BaseFacebookAdsManagerServiceProps = {
  access_token: string;
  fields?: string;
  use_account_attribution_setting: true;
  level: "campaign" | "adset" | "ad";
  time_ranges: string;
  app_secret_key?: string; // Require app secret or app secret proof for API calls with access tokens used outside of trusted contexts.
};

type MarketingApiAccessTokenConfigProps = Omit<
  BaseFacebookAdsManagerServiceProps,
  "level" | "time_ranges" | "use_account_attribution_setting" | "fields"
>;
export type {
  BaseFacebookAdsManagerServiceProps,
  MarketingApiAccessTokenConfigProps,
};

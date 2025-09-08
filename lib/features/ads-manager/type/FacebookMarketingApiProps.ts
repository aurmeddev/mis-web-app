type BaseFacebookAdsManagerServiceProps = {
  access_token: string;
  fields?: string;
  use_account_attribution_setting: true;
  level: "campaign" | "adset" | "ad";
  time_ranges: string;
};

type MarketingApiAccessTokenConfigProps = Omit<
  BaseFacebookAdsManagerServiceProps,
  "level" | "time_ranges" | "use_account_attribution_setting" | "fields"
>;
export type {
  BaseFacebookAdsManagerServiceProps,
  MarketingApiAccessTokenConfigProps,
};

type BaseFacebookAdsManagerServiceProps = {
  access_token: string;
  time_ranges: string;
  app_secret_key?: string; // Require app secret or app secret proof for API calls with access tokens used outside of trusted contexts.
  filtering?: { field: string; operator: "CONTAIN"; value: string }[];
};

type UpdateDeliveryStatusProps = {
  id: string; // Campaign ID or Ad Set ID
  status?: "ACTIVE" | "PAUSED";
};
type MarketingApiAccessTokenConfigProps = Omit<
  BaseFacebookAdsManagerServiceProps,
  "time_ranges" | "filtering"
>;
export type {
  BaseFacebookAdsManagerServiceProps,
  MarketingApiAccessTokenConfigProps,
  UpdateDeliveryStatusProps,
};

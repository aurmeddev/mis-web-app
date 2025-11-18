type BaseVoluumApiProps = {
  v_campaign_id: string;
  filter: string;
  spend: number;
  adset_name: string;
  date_from: string;
  date_to: string;
  sessionToken: string;
};

type UpdateCostProps = Pick<
  BaseVoluumApiProps,
  "spend" | "v_campaign_id" | "sessionToken" | "date_from" | "date_to"
>;

export type { UpdateCostProps };

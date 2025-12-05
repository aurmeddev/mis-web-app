import { ApiResponseProps } from "@/database/query";

interface ICostUpdate {
  spend: number;
  date_from: string;
  date_to: string;
  campaign_id: string;
}

interface ICostUpdateGateway {
  costUpdate: (params: ICostUpdate) => Promise<ApiResponseProps>;
}

export type { ICostUpdate, ICostUpdateGateway };

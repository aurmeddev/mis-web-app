import { ApiResponseProps } from "@/database/query";
interface IExport {
  date_from: string;
  date_to: string;
  campaign_id: string;
}
interface IExportGateway {
  exportData: (params: IExport) => Promise<ApiResponseProps>;
}

export type { IExport, IExportGateway };

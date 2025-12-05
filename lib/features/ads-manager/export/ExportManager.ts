import { ApiResponseProps } from "@/database/query";
import { IExport, IExportGateway } from "./IExport";

export class ExportManager {
  constructor(private gateway: IExportGateway) {}
  async process(params: IExport): Promise<ApiResponseProps> {
    return this.gateway.exportData(params);
  }
}

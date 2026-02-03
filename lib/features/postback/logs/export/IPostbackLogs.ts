import { ApiResponseProps } from "@/database/query";

interface IExportPostbackLogs {
  date_from: string;
  date_to: string;
}

interface IPostbackLogs {
  export: (params: IExportPostbackLogs) => Promise<ApiResponseProps>;
  findByPixel: (params: { pixel: string }) => Promise<ApiResponseProps>;
}

interface IUpdatePostbackLogStatus {
  updatePostbackLogStatus: (params: {
    pixel: string;
  }) => Promise<ApiResponseProps>;
}
export type { IExportPostbackLogs, IPostbackLogs, IUpdatePostbackLogStatus };

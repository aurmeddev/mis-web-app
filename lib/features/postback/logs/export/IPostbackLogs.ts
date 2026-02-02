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
    id: number;
  }) => Promise<ApiResponseProps>;
}
export type { IExportPostbackLogs, IPostbackLogs, IUpdatePostbackLogStatus };

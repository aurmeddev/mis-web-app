import { ApiResponseProps } from "@/database/query";

interface IPostbackLogs {
  date_from: string;
  date_to: string;
}

interface IExportPostbackLogs {
  export: (params: IPostbackLogs) => Promise<ApiResponseProps>;
  findByPixel: (params: { pixel: string }) => Promise<ApiResponseProps>;
}

export type { IPostbackLogs, IExportPostbackLogs };

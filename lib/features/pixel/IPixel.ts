import { ApiResponseProps } from "@/database/query";
import { BaseSearchKeywordProps } from "../search-keyword/type/SearchKeywordProps";

interface IPixelPost {
  pixel: string;
  token: string;
  traffic_source_id?: number;
}

interface IPixelUpdate extends Partial<Omit<IPixelPost, "traffic_source_id">> {
  id: number;
}
interface IPixelFindClient extends BaseSearchKeywordProps {}
interface IPixelFindClientModule {
  find(params: IPixelFindClient): Promise<ApiResponseProps>;
}

interface IPixelFindServer extends Pick<IPixelFindClient, "searchKeyword"> {
  payload: object;
  requestUrlSearchParams: any;
}
interface IPixelFindServerModule {
  find(params: IPixelFindServer): Promise<ApiResponseProps>;
}

interface IPixel {
  post(params: IPixelPost): Promise<ApiResponseProps>;
  update(params: IPixelUpdate): Promise<ApiResponseProps>;
}

export type {
  IPixelPost,
  IPixelUpdate,
  IPixel,
  IPixelFindClient,
  IPixelFindClientModule,
  IPixelFindServerModule,
  IPixelFindServer,
};

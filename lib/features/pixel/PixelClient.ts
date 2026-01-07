import { ApiResponseProps } from "@/database/query";
import {
  IPixel,
  IPixelFindClientModule,
  IPixelFindClient,
  IPixelPost,
  IPixelUpdate,
} from "./IPixel";
import { appBaseUrl } from "@/lib/base-url/appBaseUrl";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
export class PixelClient implements IPixel, IPixelFindClientModule {
  private baseUrl: string = `${appBaseUrl}/api/pixels`;
  async post(params: IPixelPost): Promise<ApiResponseProps> {
    const response = await fetch(`${this.baseUrl}/post`, {
      method: "POST",
      body: JSON.stringify(params),
    });
    return await response.json();
  }

  async find(params: IPixelFindClient): Promise<ApiResponseProps> {
    const { searchKeyword, dynamicSearchPayload, ...searchParamsUtils } =
      params;
    const searchParams = new SearchParamsManager();
    const searchQueryParams = searchParams.append(searchParamsUtils);
    const response = await fetch(
      `${this.baseUrl}/find/${searchKeyword}${searchQueryParams}`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(dynamicSearchPayload || {}),
      }
    );
    return await response.json();
  }

  async update(params: IPixelUpdate): Promise<ApiResponseProps> {
    const response = await fetch(`${this.baseUrl}/update`, {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(params),
    });
    return await response.json();
  }
}

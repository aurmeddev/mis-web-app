import { IPostbackTrackingParams } from "./IPostbackTrackingParams";
interface IFacebookConversionApi {
  postback(params: IPostbackTrackingParams): Promise<any>;
  processPayload(
    params: IFacebookConversionApiParams,
  ): IFacebookConversionApiPayload;
  conversionApiEndpoint(
    pixel: { pixel: string },
    payload: IFacebookConversionApiPayload,
    accessToken: { accessToken: string },
  ): Promise<any>;
}
interface IFacebookConversionApiPayload {
  data: {
    event_name: string;
    event_time: number;
    action_source: string;
    user_data: {
      fbc?: string;
      client_ip_address: string;
      client_user_agent: string;
    };
    custom_data: {
      currency: string;
      value: string | number;
    };
  }[];
}

interface IFacebookConversionApiParams extends Omit<
  IPostbackTrackingParams,
  "pid" | "pwaclid" | "trafficsource" | "campaignid"
> {}

export type {
  IFacebookConversionApiPayload,
  IFacebookConversionApiParams,
  IFacebookConversionApi,
};

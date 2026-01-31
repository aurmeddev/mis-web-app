import { DatetimeUtils } from "@/lib/utils/date/DatetimeUtils";
import { IFacebookConversionApiPayload } from "../../../postback/IFacebookConversionApi";
import { GraphFacebookApiConfig } from "@/lib/features/ads-manager/facebook/config/GraphFacebookApiConfig";

export class FacebookPixelDebuggerServerApi extends GraphFacebookApiConfig {
  debug = async (params: { pixel: string; token: string }) => {
    const { pixel, token } = params;
    try {
      const response = await fetch(
        `${this.baseUrl}/${this.version}/${pixel}/events?access_token=${token}`,
        {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(this.getPayload()),
        },
      );
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const data = await response.json();
      console.log("Facebook Pixel Debugger API Response:", data);
      return { isSuccess: true, message: "Postback test successful!" };
    } catch (error: any) {
      const result = JSON.parse(error.message);
      console.error("Facebook Pixel Debugger API Error:", result);
      return { isSuccess: false, message: "Conversion API Postback Error" };
    }
  };

  getPayload = () => {
    const dateUtil = new DatetimeUtils();
    const payload: IFacebookConversionApiPayload = {
      data: [
        {
          event_name: "POSTBACK TEST",
          event_time: dateUtil.getUnixTimestampSeconds(),
          action_source: "website",
          user_data: {
            client_ip_address: "2001:d08:2810:12f:d8c:c18c:f795:d04b",
            client_user_agent:
              "Mozilla/5.0 (iPhone; CPU iPhone OS 18_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/22D72 [FBAN/FBIOS;FBAV/501.0.0.49.107;FBBV/699723644;FBDV/iPhone17,2;FBMD/iPhone;FBSN/iOS;FBSV/18.3.1;FBSS/3;FBID/phone;FBLC/en_Qaau_GB;FBOP/5;FBRV/703296132;IABMV/1]",
          },
          custom_data: {
            currency: "USD",
            value: 1,
          },
        },
      ],
    };

    return payload;
  };
}

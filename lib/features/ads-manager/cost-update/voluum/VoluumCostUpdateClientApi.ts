import { ApiResponseProps } from "@/database/query";
import { ICostUpdate, ICostUpdateGateway } from "../ICostUpdate";
import { appBaseUrl } from "@/lib/base-url/appBaseUrl";

export class VoluumCostUpdateClientApi implements ICostUpdateGateway {
  async costUpdate(params: ICostUpdate): Promise<ApiResponseProps> {
    const response = await fetch(
      `${appBaseUrl}/api/ads-manager/bulk-cost-update`,
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(params),
      }
    );
    return await response.json();
  }
}

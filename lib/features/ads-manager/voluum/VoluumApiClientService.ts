import { appBaseUrl } from "@/lib/base-url/appBaseUrl";
import { UpdateCostProps } from "./type/VoluumApiProps";
import { ApiResponseProps } from "@/database/query";

export class VoluumApiClientService {
  async updateCost(
    params: Omit<UpdateCostProps, "sessionToken">
  ): Promise<ApiResponseProps> {
    const response = await fetch(`${appBaseUrl}/api/voluum/cost-update`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(params),
    });
    return await response.json();
  }
}

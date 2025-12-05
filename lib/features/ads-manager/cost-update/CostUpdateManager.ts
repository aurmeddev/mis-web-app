import { ApiResponseProps } from "@/database/query";
import { ICostUpdate, ICostUpdateGateway } from "./ICostUpdate";

export class CostUpdateManager {
  constructor(private gateway: ICostUpdateGateway) {}
  async process(params: ICostUpdate): Promise<ApiResponseProps> {
    return this.gateway.costUpdate(params);
  }
}

// Example usage
// const api = new CostUpdateManager(new VoluumCostUpdateApi({ token: "qwerty" }));
// const result = await api.process({
//   spend: 1,
//   date_from: `2025-12-04T00:00:00.000`,
//   date_to: `2025-12-04T23:59:59.999`,
//   campaign_id: "abc123",
// });

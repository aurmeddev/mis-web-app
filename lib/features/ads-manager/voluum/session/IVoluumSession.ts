import { ApiResponseProps } from "@/database/query";

interface IVoluumSession {
  generateToken: () => Promise<ApiResponseProps>;
}

export type { IVoluumSession };

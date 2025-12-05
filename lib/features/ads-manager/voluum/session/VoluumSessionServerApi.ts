import { ApiResponseProps } from "@/database/query";
import { IVoluumSession } from "./IVoluumSession";
import { appBaseUrl } from "@/lib/base-url/appBaseUrl";

export class VoluumSessionServerApi implements IVoluumSession {
  generateToken = async (): Promise<ApiResponseProps> => {
    const response = await fetch(`${appBaseUrl}/api/voluum/get-session`, {
      method: "GET",
      headers: {
        "Content-type": "application/json",
      },
      next: { revalidate: 5400 }, // Revalidate every 1.5 hours or 5400 seconds
    });

    return await response.json();
  };
}

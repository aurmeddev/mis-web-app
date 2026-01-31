import { appBaseUrl } from "@/lib/base-url/appBaseUrl";

export class FacebookPixelDebuggerClientApi {
  debug = async (params: { pixel: string; token: string }) => {
    const response = await fetch(`${appBaseUrl}/api/pixels/debugger/facebook`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(params),
    });

    return await response.json();
  };
}

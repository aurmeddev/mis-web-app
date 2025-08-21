import { appBaseUrl } from "@/lib/base-url/appBaseUrl";
import { CryptoProps } from "./type/CryptoMethodProps";
export class CryptoClientService {
  async encrypt(params: CryptoProps) {
    const payload = params;
    const response = await fetch(`${appBaseUrl}/api/auth/encrypt`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return await response.json();
  }
  async decrypt(params: CryptoProps) {
    const payload = params;
    const response = await fetch(`${appBaseUrl}/api/auth/decrypt`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return await response.json();
  }
}

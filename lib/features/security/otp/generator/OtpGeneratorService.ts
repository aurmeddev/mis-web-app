import { appBaseUrl } from "@/lib/base-url/appBaseUrl";
import { GenerateOTPProps } from "./type/OtpGeneratorProps";

export class OtpGeneratorService {
  async generate(params: GenerateOTPProps) {
    try {
      const response = await fetch(`${appBaseUrl}/api/auth/otp/generator`, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(params),
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      return await response.json();
    } catch (error: any) {
      console.log(JSON.parse(error.message));
      return {
        isSuccess: false,
        message: "Something went wrong! Please try again.",
        data: [],
      };
    }
  }
}

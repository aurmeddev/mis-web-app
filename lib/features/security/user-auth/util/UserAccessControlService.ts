import { isEnvProduction } from "@/lib/env/isEnvProduction";
import { UserAuthManager } from "../UserAuthManager";
import { UserAuthServerService } from "../UserAuthServerService";
import { VerifyUserIpParams } from "../type/UserAuthProps";

export class UserAccessControlService {
  async verifyUserAccessByIp(params: VerifyUserIpParams) {
    // Check if the environment is production.
    // In production, we will check if the user is whitelisted.
    if (isEnvProduction) {
      const auth = new UserAuthManager(new UserAuthServerService());
      const { ip_address } = params;

      const userIpVerificationResult = await auth.verifyUserIp({
        ip_address: `${ip_address}`,
      });

      if (!userIpVerificationResult.isSuccess) {
        return userIpVerificationResult;
      }
    }

    return {
      isSuccess: true,
    };
  }
}

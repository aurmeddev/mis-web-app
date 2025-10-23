import { isEnvProduction } from "@/lib/env/isEnvProduction";
import { UserAuthManager } from "../UserAuthManager";
import { UserAuthServerService } from "../UserAuthServerService";
import { VerifyUserIpParams } from "../type/UserAuthProps";

export class UserAccessController {
  async verifyUserByIp(params: VerifyUserIpParams) {
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

  verifyUserNavMenuAccess(params: { navMain: any; pathname?: string }) {
    const { navMain, pathname } = params;
    if (!pathname) {
      return false;
    }
    const checkAccess = navMain.map((nav: any) =>
      nav.items?.some((item: any) => {
        return item.url === pathname;
      })
    );
    return checkAccess.some((access: any) => access === true);
  }
}

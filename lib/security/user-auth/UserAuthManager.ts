import { UserLoginParams, VerifyUserIpParams } from "./type/UserAuthProps";

export class UserAuthManager {
  constructor(private handler: any) {
    this.handler = handler;
  }

  async destroySession() {
    return this.handler.destroySession();
  }

  async login(params: UserLoginParams) {
    return this.handler.login(params);
  }

  async logout() {
    return this.handler.logout();
  }

  async keepSessionAlive() {
    return this.handler.keepSessionAlive();
  }

  isTokenValid(token: string) {
    return this.handler.isTokenValid(token);
  }

  async verifyUserIp(params: VerifyUserIpParams) {
    return this.handler.verifyUserIp(params);
  }

  async getUserIpAddress() {
    return this.handler.getUserIpAddress();
  }
}

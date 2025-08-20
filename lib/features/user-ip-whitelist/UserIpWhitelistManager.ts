import {
  PostUserIpWhitelistParams,
  UserIpWhitelistMethodProps,
  UpdateUserIpWhitelistStatusParams,
  UpdateUserIpWhitelistInfoParams,
  FindUserIpWhitelistParams,
  PaginationUserIpWhitelistProps,
} from "./type/UserIpWhitelistProps";

export class UserIpWhitelistManager {
  constructor(private service: UserIpWhitelistMethodProps) {
    this.service = service;
  }

  async post(params: PostUserIpWhitelistParams) {
    return this.service.post(params);
  }

  async setActive(params: UpdateUserIpWhitelistStatusParams) {
    return this.service.setActive(params);
  }

  async update(params: UpdateUserIpWhitelistInfoParams) {
    return this.service.update(params);
  }

  async find(params: FindUserIpWhitelistParams) {
    return this.service.find(params);
  }

  async get(params: PaginationUserIpWhitelistProps) {
    return this.service.get(params);
  }
}

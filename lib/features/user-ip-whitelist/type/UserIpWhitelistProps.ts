import { ApiResponseProps } from "@/database/dbConnection";
type PostUserIpWhitelistParams = {
  ip_address: string;
  name: string;
};

type UpdateUserIpWhitelistStatusParams = { id: number; is_active: 0 | 1 };
type UpdateUserIpWhitelistInfoParams = PostUserIpWhitelistParams & {
  id: number;
};
type FindUserIpWhitelistParams = {
  searchKey: string;
};

type PaginationUserIpWhitelistProps = {
  page: number;
  limit: number;
};

type UserIpWhitelistMethodProps = {
  post: (params: PostUserIpWhitelistParams) => Promise<ApiResponseProps>;
  setActive: (
    params: UpdateUserIpWhitelistStatusParams
  ) => Promise<ApiResponseProps>;
  update: (
    params: UpdateUserIpWhitelistInfoParams
  ) => Promise<ApiResponseProps>;
  find: (params: FindUserIpWhitelistParams) => Promise<ApiResponseProps>;
  get: (params: PaginationUserIpWhitelistProps) => Promise<ApiResponseProps>;
};

export type {
  UserIpWhitelistMethodProps,
  PostUserIpWhitelistParams,
  UpdateUserIpWhitelistStatusParams,
  UpdateUserIpWhitelistInfoParams,
  FindUserIpWhitelistParams,
  PaginationUserIpWhitelistProps,
};

type UserLoginParams = {
  ip_address?: string;
  email: string;
  password: string;
};

type VerifyUserIpParams = {
  ip_address: string;
};

export type { UserLoginParams, VerifyUserIpParams };

type BaseApProfilesProps = {
  profile_name: string;
  username: string;
  password: string;
  long_2fa_key?: string;
  marketing_api_access_token?: string;
  is_active: 0 | 1;
  created_by: number;
  created_at: Date;
};

type PostApProfilesProps = Omit<
  BaseApProfilesProps,
  "is_active" | "created_by" | "created_at"
>;

type UpdateApProfilesProps = Omit<
  BaseApProfilesProps,
  "is_active" | "created_by" | "created_at"
> & {
  id: number;
};

type ToggleApProfilesStatusProps = Omit<
  BaseApProfilesProps,
  | "profile_name"
  | "username"
  | "password"
  | "long_2fa_key"
  | "marketing_api_access_token"
  | "created_by"
  | "created_at"
> & {
  id: number;
};

export type {
  BaseApProfilesProps,
  PostApProfilesProps,
  UpdateApProfilesProps,
  ToggleApProfilesStatusProps,
};

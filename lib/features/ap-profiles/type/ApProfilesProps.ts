import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";

type BaseApProfilesProps = {
  profile_name: string;
  fb_owner_name?: string;
  username: string;
  password: string;
  app_2fa_code?: string;
  marketing_api_access_token?: string;
  recovery_codes: any;
  remarks?: string;
  is_active: 0 | 1 | 2; // 0: Inactive, 1: Active, 2: New AP Profile
  created_by: {
    full_name: string;
    team_name: string;
  };
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
  | "fb_owner_name"
  | "recovery_codes"
  | "remarks"
  | "username"
  | "password"
  | "app_2fa_code"
  | "marketing_api_access_token"
  | "created_by"
  | "created_at"
> & {
  id: number;
};

type FindApProfilesProps = {
  searchKey: string;
};

type GetAllApProfilesProps = Omit<PaginationProps, "total_pages"> & {
  recruiter?: string;
};

type PostRecoveryCodesProps = {
  ap_profile_id: number;
  recovery_code: string;
};

export type {
  BaseApProfilesProps,
  PostApProfilesProps,
  UpdateApProfilesProps,
  ToggleApProfilesStatusProps,
  FindApProfilesProps,
  GetAllApProfilesProps,
  PostRecoveryCodesProps,
};

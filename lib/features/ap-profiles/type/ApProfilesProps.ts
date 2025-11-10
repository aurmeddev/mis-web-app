import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";
import { BaseSearchKeywordProps } from "../../search-keyword/type/SearchKeywordProps";
import { PostApProfileBrandPermissionsProps } from "../../users/permissions/type/UserPermissionsProps";

type BaseApProfilesProps = {
  profile_name: string;
  fb_account_id: number;
  remarks?: string;
  id: number; // auto-incremented in the database
  is_active: 0 | 1; // 0: Inactive, 1: Active
  created_by:
    | {
        full_name: string;
        team_name: string;
      }
    | number;
  created_at: string;
};

type ApProfileBrandPermissionsProps = PostApProfileBrandPermissionsProps;

type PostApProfilesProps = Pick<
  BaseApProfilesProps,
  "profile_name" | "fb_account_id" | "remarks"
> & {
  marketing_api_access_token?: string;
  app_secret_key?: string;
  brand_permissions?: Pick<ApProfileBrandPermissionsProps, "brand_id">; // NOTE: Remove the ? to make it required if frontend is ready
};

type UpdateApProfilesProps = Omit<
  BaseApProfilesProps,
  "is_active" | "created_by" | "created_at"
> & {
  new_profile_name?: string;
  new_fb_account_id?: number;
  marketing_api_access_token?: string;
  app_secret_key?: string;
  brand_permissions?: ApProfileBrandPermissionsProps;
};

type ToggleApProfilesStatusProps = Pick<
  BaseApProfilesProps,
  "id" | "is_active"
>;

type FindApProfilesProps = BaseSearchKeywordProps;

type GetAllApProfilesProps = Omit<PaginationProps, "total_pages"> & {
  status?: "active" | "available";
};

export type {
  BaseApProfilesProps,
  PostApProfilesProps,
  UpdateApProfilesProps,
  ToggleApProfilesStatusProps,
  FindApProfilesProps,
  GetAllApProfilesProps,
};

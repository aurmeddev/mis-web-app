import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";
import { BaseSearchKeywordProps } from "../../search-keyword/type/SearchKeywordProps";

type BaseApProfilesProps = {
  id: number; // auto-incremented in the database
  profile_name: string;
  fb_account_id?: number;
  remarks?: string;
  is_active: 0 | 1; // 0: Inactive, 1: Active
  created_by:
    | {
        full_name: string;
        team_name: string;
      }
    | number;
  created_at: Date;
};

type PostApProfilesProps = Omit<
  BaseApProfilesProps,
  "id" | "is_active" | "created_by" | "created_at"
>;

type UpdateApProfilesProps = Omit<
  BaseApProfilesProps,
  "is_active" | "created_by" | "created_at"
>;

type ToggleApProfilesStatusProps = Omit<
  BaseApProfilesProps,
  "profile_name" | "fb_account_id" | "remarks" | "created_by" | "created_at"
>;

type FindApProfilesProps = BaseSearchKeywordProps;

type GetAllApProfilesProps = Omit<PaginationProps, "total_pages"> & {
  recruiter?: string;
};

export type {
  BaseApProfilesProps,
  PostApProfilesProps,
  UpdateApProfilesProps,
  ToggleApProfilesStatusProps,
  FindApProfilesProps,
  GetAllApProfilesProps,
};

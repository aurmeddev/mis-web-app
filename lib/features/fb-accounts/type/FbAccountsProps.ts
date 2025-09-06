import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";
import { BaseSearchKeywordProps } from "../../search-keyword/type/SearchKeywordProps";

type BaseFbAccountsProps = {
  id: number; // auto-incremented in the database
  fb_owner_name?: string; // required
  recruited_by:
    | {
        full_name: string;
        team_name: string;
      }
    | number;
  contact_no?: string;
  email_address?: string;
  username?: string; // required
  password?: string; // required
  app_2fa_key?: string;
  marketing_api_access_token?: string;
  recovery_code?: string;
  fb_owner_account_created?: Date;
  no_of_friends?: number;
  fb_account_quality_type_id?: number;
  created_at: string; // auto-generated in the database
  remarks?: string;
};

type PostFbAccountsProps = Omit<
  BaseFbAccountsProps,
  "id" | "recruited_by" | "created_at" | "fb_account_quality_type_id"
>;

type UpdateFbAccountsProps = Omit<
  BaseFbAccountsProps,
  "recruited_by" | "created_at" | "fb_account_quality_type_id"
>;

type ToggleFbAccountQualityStatusProps = Omit<
  BaseFbAccountsProps,
  | "fb_owner_name"
  | "recruited_by"
  | "contact_no"
  | "email_address"
  | "username"
  | "password"
  | "app_2fa_key"
  | "marketing_api_access_token"
  | "recovery_code"
  | "fb_owner_account_created"
  | "no_of_friends"
  | "created_at"
  | "remarks"
>;

type PostRecoveryCodesProps = {
  fb_account_id: number;
  recovery_code: string;
};

type FindFbAccountsProps = BaseSearchKeywordProps;

type GetAllFbAccountsProps = Omit<PaginationProps, "total_pages"> & {
  recruiter?: string;
  status?: "active" | "available";
};

export type {
  BaseFbAccountsProps,
  PostFbAccountsProps,
  PostRecoveryCodesProps,
  GetAllFbAccountsProps,
  FindFbAccountsProps,
  ToggleFbAccountQualityStatusProps,
  UpdateFbAccountsProps,
};

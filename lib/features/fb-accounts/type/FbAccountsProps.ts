import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";

type BaseFbAccountsProps = {
  id: number; // auto-incremented in the database
  fb_owner_name: string;
  recruited_by:
    | {
        full_name: string;
        team_name: string;
      }
    | number;
  contact_no: string;
  email_address: string;
  username: string;
  password: string;
  app_2fa_key: string;
  marketing_api_access_token: string;
  recovery_code: string;
  fb_owner_account_created: Date;
  no_of_friends: number;
  fb_account_quality_status_id: number;
  created_at: Date; // auto-generated in the database
};

type PostFbAccountsProps = Omit<
  BaseFbAccountsProps,
  "id" | "recruited_by" | "created_at" | "fb_account_quality_status_id"
>;

type PostRecoveryCodesProps = {
  fb_account_id: number;
  recovery_code: string;
};

type FindFbAccountsProps = {
  searchKeyword: string;
  method: "find-one" | "find-many";
  dynamicSearchPayload?: object; // Search multiple fields or columns
};

type GetAllFbAccountsProps = Omit<PaginationProps, "total_pages"> & {
  recruiter?: string;
};

export type {
  BaseFbAccountsProps,
  PostFbAccountsProps,
  PostRecoveryCodesProps,
  GetAllFbAccountsProps,
  FindFbAccountsProps,
};

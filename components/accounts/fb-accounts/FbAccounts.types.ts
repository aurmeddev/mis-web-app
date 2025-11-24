import { GeneratorSearchResultsProps } from "@/components/otp-generator/type";
import { ApiResponseProps } from "@/database/query";
import { GetAllFbAccountsProps } from "@/lib/features/fb-accounts/type/FbAccountsProps";
import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";

// Subtypes
type Recruiter = {
  id: number;
  full_name: string;
  team_name: string;
};

type CreatedBy = {
  full_name: string;
  team_name: string;
};

type APProfile = {
  id: number;
  status: string;
  remarks: string;
  created_at: string; // timestamp
  created_by: CreatedBy;
  profile_name: string;
  fb_account_id: number;
};

// Main Types
type FBAccount = {
  id: number;
  fb_owner_name: string;
  contact_no: string;
  email_address: string;
  username: string;
  password: string;
  app_2fa_key: string;
  marketing_api_access_token: string;
  recovery_code: string;
  age_of_fb: string;
  no_of_friends: number;
  fb_account_quality: string;
  remarks: string;
  status: string;
  recruited_by: Recruiter;
  ap_profile: APProfile;
  row_id: number;
  fb_owner_account_created: string;
  created_at: string;
};

type FBAccountForm = Pick<
  FBAccount,
  | "fb_owner_name"
  | "email_address"
  | "contact_no"
  | "username"
  | "password"
  | "app_2fa_key"
  | "recovery_code"
  | "remarks"
>;

type RecruiterOption = {
  id: number;
  label: string;
  value: string;
  totals: number; //total added
};

type ApplyFilter = {
  selectedRecruiter: string[];
  selectedStatus: string;
};

type FbAccountsFilterProps = {
  recruiters: RecruiterOption[];
  onApplyFilter: ({ selectedRecruiter, selectedStatus }: ApplyFilter) => void;
  searchParams: Omit<GetAllFbAccountsProps, "recruiter"> & {
    //override recruiter with type of string to string[]
    recruiter: string[];
  };
  isSuperOrAdmin: boolean;
};

type FbAccountsSearchResultsProps = GeneratorSearchResultsProps;

type FbAccountsTableContainerProps = {
  response: ApiResponseProps & { pagination?: PaginationProps };
  recruiters: RecruiterOption[];
  isSuperOrAdmin: boolean;
};

export type {
  ApplyFilter,
  FBAccount,
  FBAccountForm,
  RecruiterOption,
  FbAccountsFilterProps,
  FbAccountsSearchResultsProps,
  FbAccountsTableContainerProps,
};

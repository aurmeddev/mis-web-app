import { SelectOptions } from "@/components/shared/select/type";
import { ApiResponseProps } from "@/database/query";
import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";
import { Dispatch, FormEvent, SetStateAction } from "react";

type ApProfilesTableContainerProps = {
  brands: SelectOptions[];
  response: ApiResponseProps & {
    pagination?: PaginationProps;
  };
  hasAccessToMarketingApiAccessToken: boolean;
};

type Pagination = { page: number; limit: number };

type ProfileForm = {
  profile_name: string;
  fb_account_id?: number;
  marketing_api_access_token: string;
  app_secret_key: string;
  remarks?: string;
};

type AccessTokenState = {
  isChecking?: boolean;
  isValid: boolean;
  title: string;
  description: string;
};

export type ProfileEditState = { id: number | null; state: string };

type CreatedBy = {
  full_name: string;
  team_name: string;
};

type RecruitedBy = {
  id: string;
  full_name: string;
  team_name: string;
};

type FbAccount = {
  id: number;
  status: string;
  remarks: string;
  password: string;
  username: string;
  age_of_fb: string;
  contact_no: string;
  app_2fa_key: string;
  app_secret_key: string;
  recruited_by: RecruitedBy;
  email_address: string;
  fb_owner_name: string;
  no_of_friends: number;
  recovery_code: string;
  fb_account_quality: string;
  fb_owner_account_created: string;
  marketing_api_access_token: string;
};

type Profile = {
  row_id?: number;
  id: number;
  fb_account_id: number;
  profile_name: string;
  remarks: string | null;
  fb_account: FbAccount;
  marketing_api_access_token: string;
  app_secret_key: string;
  status: string;
  created_by: CreatedBy;
  created_at: string;
};

type SearchWrapperProps = {
  searchQuery: any;
  onSearchQueryChange: (q: any) => void;
  onSearchFocus: () => void;
  onRemoveSelected: () => void;
  showResults: boolean;
  setShowResults: Dispatch<SetStateAction<boolean>>;
  disabled?: boolean;
  SelectedRenderer: React.ReactNode; // custom selected UI
  ResultsRenderer: React.ReactNode; // custom results component
};

type ApProfilesDialogProps = {
  accessTokenState: AccessTokenState;
  brands: SelectOptions[];
  canSave: boolean;
  editingData: any;
  form: any;
  hasAccessToMarketingApiAccessToken: boolean;
  handleSubmit: (ev: FormEvent<HTMLFormElement>) => void;
  handleInputChange: (name: string, value: string | number) => void;
  handleModifyEditingData: (params: {
    marketing_api_access_token?: string;
    app_secret_key?: string;
  }) => void;
  isActionDisabled: boolean;
  isDialogOpen: boolean;
  onAccessTokenStateChange: (token: string) => void;
  onUpdateStep: (step: number) => void;
  onBrandChange: (value: string[]) => void;
  selectedBrandAccess: string[];
  setIsDialogOpen: (open: boolean) => void;
  step: number;
};

type ManageApProfilesTableProps = {
  data: any;
  handleEditChange: (id: number | null) => void;
  profileEditState: ProfileEditState;
};

type UseApProfilesProps = {
  brands: SelectOptions[];
  response: ApiResponseProps & {
    pagination?: PaginationProps;
  };
};

export type {
  ApProfilesTableContainerProps,
  ApProfilesDialogProps,
  SearchWrapperProps,
  Pagination,
  ProfileForm,
  AccessTokenState,
  CreatedBy,
  RecruitedBy,
  FbAccount,
  Profile,
  ManageApProfilesTableProps,
  UseApProfilesProps,
};

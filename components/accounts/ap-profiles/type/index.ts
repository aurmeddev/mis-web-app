export type CreatedBy = {
  full_name: string;
  team_name: string;
};

export type RecruitedBy = {
  id: string;
  full_name: string;
  team_name: string;
};

export type FbAccount = {
  id: number;
  status: string;
  remarks: string;
  password: string;
  username: string;
  age_of_fb: string;
  contact_no: string;
  app_2fa_key: string;
  recruited_by: RecruitedBy;
  email_address: string;
  fb_owner_name: string;
  no_of_friends: number;
  recovery_code: string;
  fb_account_quality: string;
  fb_owner_account_created: string;
  marketing_api_access_token: string;
};

export type Profile = {
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

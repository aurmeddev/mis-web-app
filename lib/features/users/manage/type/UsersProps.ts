import { BaseSearchKeywordProps } from "@/lib/features/search-keyword/type/SearchKeywordProps";
import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";

type GetAllUsersProps = Omit<PaginationProps, "total_pages"> & {
  user_type?: number;
  team?: number;
  status?: "active" | "inactive";
};

type PostUsersProps = {
  full_name: string;
  display_name?: string;
  email: string;
  password: string;
  gender_type_id: number;
  user_type_id: number;
  team_id: number;
};

type FindUsersProps = BaseSearchKeywordProps;

type ToggleStatusUsersProps = { id: string; is_active: 0 | 1 };

type UpdateUsersProps = PostUsersProps & { id: string };
export type {
  GetAllUsersProps,
  PostUsersProps,
  FindUsersProps,
  ToggleStatusUsersProps,
  UpdateUsersProps,
};

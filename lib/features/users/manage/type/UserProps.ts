import { BaseSearchKeywordProps } from "@/lib/features/search-keyword/type/SearchKeywordProps";
import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";

type GetAllUserProps = Omit<PaginationProps, "total_pages"> & {
  user_type?: number;
  team?: number;
  status?: "active" | "inactive";
};

type PostUserProps = {
  full_name: string;
  display_name?: string;
  email: string;
  password: string;
  gender_type_id: number;
  user_type_id: number;
  team_id: number;
};

type FindUserProps = BaseSearchKeywordProps;

type ToggleStatusUserProps = { id: string; is_active: 0 | 1 };

type UpdateUserProps = PostUserProps & { id: string };
export type {
  GetAllUserProps,
  PostUserProps,
  FindUserProps,
  ToggleStatusUserProps,
  UpdateUserProps,
};

import { BaseSearchKeywordProps } from "@/lib/features/search-keyword/type/SearchKeywordProps";
import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";
type BaseUsersAccessProps = {
  id: number;
  user_id: number;
  main_menu: {
    main_menu_id: number;
    sub_menu: {
      sub_menu_id: number;
      main_menu_id: number;
    }[];
  }[];
  is_active: 0 | 1;
};

type PostUsersAccessProps = Omit<BaseUsersAccessProps, "id" | "is_active">;
type FindUsersAccessProps = BaseSearchKeywordProps;
type GetUsersAccessProps = PaginationProps;
type ToggleUsersAccessStatusProps = Omit<BaseUsersAccessProps, "main_menu">;
export type {
  BaseUsersAccessProps,
  GetUsersAccessProps,
  PostUsersAccessProps,
  FindUsersAccessProps,
  ToggleUsersAccessStatusProps,
};

import { BaseSearchKeywordProps } from "@/lib/features/search-keyword/type/SearchKeywordProps";
// import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";
type BaseUserMenuPermissionsProps = {
  id: number;
  user_id: string[];
  main_menu: {
    main_menu_id: number;
    sub_menu?: {
      sub_menu_id: number;
    }[];
  }[];
  is_active: 0 | 1;
};

type PostUserMenuPermissionsProps = Omit<
  BaseUserMenuPermissionsProps,
  "id" | "is_active"
>;
type VerifyUserMenuPermissionsProps = BaseSearchKeywordProps;
// type GetUserPermissionsProps = PaginationProps;
// type ToggleUserMenuPermissionsStatusProps = Omit<
//   BaseUserMenuPermissionsProps,
//   "main_menu"
// >;
export type {
  BaseUserMenuPermissionsProps,
  // GetUserPermissionsProps,
  PostUserMenuPermissionsProps,
  VerifyUserMenuPermissionsProps,
  // ToggleUserMenuPermissionsStatusProps,
};

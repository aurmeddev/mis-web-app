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

type UpdateUserMenuPermissionsProps = PostUserMenuPermissionsProps;

type VerifyPermissionsProps = Pick<BaseSearchKeywordProps, "searchKeyword"> & {
  payload: object;
  databaseTableName: string;
  staticSearchField: string;
};

type PostUserBrandPermissionsProps = {
  user_id: string[];
  brand_id: number[];
};

type UpdateUserBrandPermissionsProps = PostUserBrandPermissionsProps;

type PostApProfileBrandPermissionsProps = {
  ap_profile_id: number[];
  brand_id: number[];
};

type UpdateApProfileBrandPermissionsProps = PostApProfileBrandPermissionsProps;
// type GetUserPermissionsProps = PaginationProps;
// type ToggleUserMenuPermissionsStatusProps = Omit<
//   BaseUserMenuPermissionsProps,
//   "main_menu"
// >;
export type {
  BaseUserMenuPermissionsProps,
  PostUserMenuPermissionsProps,
  PostUserBrandPermissionsProps,
  PostApProfileBrandPermissionsProps,
  VerifyPermissionsProps,
  UpdateUserBrandPermissionsProps,
  UpdateUserMenuPermissionsProps,
  UpdateApProfileBrandPermissionsProps,
  // GetUserPermissionsProps,
  // ToggleUserMenuPermissionsStatusProps,
};

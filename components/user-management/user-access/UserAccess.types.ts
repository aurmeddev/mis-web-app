import { SelectOptions } from "@/components/shared/select/type";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Control } from "react-hook-form";
import { ParentMenu } from "./dialog/UserAccessDialog";
import {
  MenuSelectOptions,
  UserSelectOptions,
} from "@/app/(pages)/users/access/page";
import { ApiResponseProps } from "@/database/query";
import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";
import { userAccessFormSchema } from "../schema";
import z from "zod";

export type UserAccessContainerProps = {
  brands: SelectOptions[];
  menuSelectOptions: MenuSelectOptions;
  searchParams: { page: number; limit: number };
  userSelectOptions: UserSelectOptions;
};

export type UserAccessTableContainerProps = {
  response: ApiResponseProps & {
    pagination?: PaginationProps;
  };
  usersData: UserAccessRecordRaw[];
};

export type UserAccessRecordRaw = {
  row_id?: number;
  id: string;
  brand: string[];
  main_menu: string[];
  sub_menu: string[];
  created_at?: string;
  full_name: string;
  display_name: string;
  email: string;
  status: string;
  user_type_name: string;
  team_name: string;
  navMain: any;
};

export type MenuAccess = { mainMenu: string[]; subMenu: string[] };
export type UserAccessFormValues = z.infer<typeof userAccessFormSchema>;

// --- Hook Props ---
export type UseUserAccessProps = {
  response: ApiResponseProps & {
    pagination?: PaginationProps;
  };
};

export type UserAccessTableProps = {
  data: UserAccessRecordRaw[];
  editingRow: string;
  handleEditChange: (id: string) => void;
};

export type StepFieldsProps = {
  brands: SelectOptions[];
  control: Control<UserAccessFormValues>;
  menuStructure: ParentMenu[];
  onBrandChange: (value: string[]) => void;
  selectedBrandAccess: string[];
  onParentChange: (checked: CheckedState, main_menu_id: string) => void;
  onChildChange: (checked: CheckedState, sub_menu_id: string) => void;
  watchedMainMenus: string[];
  watchedSubMenus: string[];
};

export type Step1FieldsProps = Pick<StepFieldsProps, "control"> & {
  userSelectOptions: UserSelectOptions;
};

export type Step3ReviewProps = Pick<
  StepFieldsProps,
  "brands" | "selectedBrandAccess"
> & {
  selectedMenuStructure: {
    label: string;
    sub_menu: {
      label: string;
      sort: number;
    }[];
    sort: number;
  }[];
  watchedDetails: {
    display_name: string | undefined;
    email: string | undefined;
    full_name: string | undefined;
  };
};

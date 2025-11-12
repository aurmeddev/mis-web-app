import { SelectOptions } from "@/components/shared/select/type";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Control } from "react-hook-form";
import { ParentMenu } from "./dialog/UserAccessDialog";
import { ApiResponseProps } from "@/database/query";
import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";
import { userAccessFormSchema } from "../schema";
import z from "zod";

type UserAccessContainerProps = {
  brands: SelectOptions[];
  menuSelectOptions: MenuSelectOptions;
  searchParams: { page: number; limit: number };
  userSelectOptions: UserSelectOptions;
};

type UserAccessTableContainerProps = {
  response: ApiResponseProps & {
    pagination?: PaginationProps;
  };
  usersData: UserAccessRecordRaw[];
};

type UserAccessRecordRaw = {
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

type MenuAccess = { mainMenu: string[]; subMenu: string[] };
type UserAccessFormValues = z.infer<typeof userAccessFormSchema>;

type MainMenuSelectOptions = SelectOptions & {
  sort: number;
};

type SubMenuSelectOptions = MainMenuSelectOptions & {
  main_menu_id: string;
};

type UserSelectOptions = {
  teams: SelectOptions[];
  user_types: SelectOptions[];
};

type MenuSelectOptions = {
  main_menu: MainMenuSelectOptions[];
  sub_menu: SubMenuSelectOptions[];
};

// --- Hook Props ---
type UseUserAccessProps = {
  response: ApiResponseProps & {
    pagination?: PaginationProps;
  };
};

type UserAccessTableProps = {
  data: UserAccessRecordRaw[];
  editingRow: string;
  onEditChange: (id: string) => void;
  onEditStatus: (id: string, isActive: boolean) => void;
  onConfirmStatus: (id: string, isActive: boolean) => void;
  statusState: StatusState;
};

type StatusState = {
  id: string;
  isEditing: boolean;
  isActive: boolean;
  isSubmitting: boolean;
};

type StatusCellProps = {
  rowData: UserAccessRecordRaw;
  statusState: StatusState;
  onEditStatus: UserAccessTableProps["onEditStatus"];
  onConfirmStatus: UserAccessTableProps["onConfirmStatus"];
};

type StepFieldsProps = {
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

type Step1FieldsProps = Pick<StepFieldsProps, "control"> & {
  userSelectOptions: UserSelectOptions;
};

type Step3ReviewProps = Pick<
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

export type {
  UserAccessContainerProps,
  UserAccessTableContainerProps,
  UserAccessRecordRaw,
  MenuAccess,
  UserAccessFormValues,
  MainMenuSelectOptions,
  SubMenuSelectOptions,
  UserSelectOptions,
  MenuSelectOptions,
  UseUserAccessProps,
  UserAccessTableProps,
  StatusCellProps,
  StepFieldsProps,
  Step3ReviewProps,
  Step1FieldsProps,
};

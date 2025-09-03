import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";

type GetAllManageUsersProps = Omit<PaginationProps, "total_pages"> & {
  user_type?: number;
  team?: number;
  status?: "active" | "inactive";
};
export type { GetAllManageUsersProps };

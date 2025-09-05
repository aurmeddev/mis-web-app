import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";

type GetAllUsersLogsProps = Omit<PaginationProps, "total_pages"> & {
  date_from: string;
  date_to: string;
};

type PostUsersLogsProps = {
  log_type_id: number;
  created_by: number;
  description?: string;
};

export type { PostUsersLogsProps, GetAllUsersLogsProps };

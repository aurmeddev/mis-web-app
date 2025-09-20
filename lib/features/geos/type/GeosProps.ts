import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";

type GetAllGeosProps = Omit<PaginationProps, "total_pages"> & {
  status?: "active" | "inactive";
};

export type { GetAllGeosProps };

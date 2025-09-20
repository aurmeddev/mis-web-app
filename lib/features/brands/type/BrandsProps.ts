import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";

type GetAllBrandsProps = Omit<PaginationProps, "total_pages"> & {
  status?: "active" | "inactive";
};

export type { GetAllBrandsProps };

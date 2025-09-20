import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";

type GetAllMediaBuyersProps = Omit<PaginationProps, "total_pages"> & {
  status?: "active" | "inactive";
};

export type { GetAllMediaBuyersProps };

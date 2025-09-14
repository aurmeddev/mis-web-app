import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";
import { BaseSearchKeywordProps } from "../../search-keyword/type/SearchKeywordProps";

type BaseDomainManagerServiceProps = {
  domain_name: string;
};

type PostDomainManagerServiceProps = BaseDomainManagerServiceProps;
type UpdateDomainManagerServiceProps = BaseDomainManagerServiceProps & {
  id: number;
};
type FindDomainManagerServiceProps = BaseSearchKeywordProps;

type ToggleDomainManagerServiceStatusProps = { id: number; is_active: 0 | 1 };
type GetAllDomainManagerServiceProps = Omit<PaginationProps, "total_pages"> & {
  status?: "active" | "inactive";
};
export type {
  PostDomainManagerServiceProps,
  BaseDomainManagerServiceProps,
  UpdateDomainManagerServiceProps,
  FindDomainManagerServiceProps,
  ToggleDomainManagerServiceStatusProps,
  GetAllDomainManagerServiceProps,
};

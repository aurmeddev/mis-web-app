import { BaseSearchKeywordProps } from "../../search-keyword/type/SearchKeywordProps";

type BaseDomainManagerServiceProps = {
  domain_name: string;
};

type PostDomainManagerServiceProps = BaseDomainManagerServiceProps;
type UpdateDomainManagerServiceProps = BaseDomainManagerServiceProps & {
  id: number;
};
type FindDomainManagerServiceProps = BaseSearchKeywordProps;

export type {
  PostDomainManagerServiceProps,
  BaseDomainManagerServiceProps,
  UpdateDomainManagerServiceProps,
  FindDomainManagerServiceProps,
};

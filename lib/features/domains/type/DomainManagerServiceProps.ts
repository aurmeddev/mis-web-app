type BaseDomainManagerServiceProps = {
  domain_name: string;
};

type PostDomainManagerServiceProps = BaseDomainManagerServiceProps;
type UpdateDomainManagerServiceProps = BaseDomainManagerServiceProps & {
  id: number;
};

export type {
  PostDomainManagerServiceProps,
  BaseDomainManagerServiceProps,
  UpdateDomainManagerServiceProps,
};

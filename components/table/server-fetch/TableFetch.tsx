"use server";

type Fetcher<T> = (params: Record<string, any>) => Promise<T>;

// Generic Props: T = response type, CProps = extra props for the container
type Props<T, CProps = {}> = {
  searchParams: Record<string, any>;
  fetchService: Fetcher<T>;
  Container: React.ComponentType<{ response: T } & CProps>;
} & Partial<CProps>; // props optional

export async function TableFetch<T, CProps = {}>({
  searchParams,
  fetchService,
  Container,
  ...props
}: Props<T, CProps>) {
  const response = await fetchService(searchParams);

  return <Container response={response} {...(props as CProps)} />;
}

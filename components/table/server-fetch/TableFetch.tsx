"use server";

type Fetcher<T> = (params: { page: number; limit: number }) => Promise<T>;

type Props<T> = {
  searchParams: { page: number; limit: number };
  fetchService: Fetcher<T>;
  Container: React.ComponentType<{ response: T }>;
};

export async function TableFetch<T>({
  searchParams,
  fetchService,
  Container,
}: Props<T>) {
  const response = await fetchService(searchParams);
  return <Container response={response} />;
}

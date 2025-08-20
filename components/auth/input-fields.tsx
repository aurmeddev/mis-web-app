export const InputFields = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <div className="grid gap-6">{children}</div>;
};

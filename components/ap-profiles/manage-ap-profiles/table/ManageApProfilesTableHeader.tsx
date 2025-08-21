import { TableHeader, TableRow, TableHead } from "@/components/ui/table";

type ManageApProfilesTableHeaderProps = {
  headers: {
    label: string;
    icon?: React.ReactNode;
    className: string;
    colSpan?: number;
  }[];
};

export function ManageApProfilesTableHeader({
  headers,
}: ManageApProfilesTableHeaderProps) {
  return (
    <TableHeader className="bg-muted border-r-0 border-separate border-spacing-0 sticky -top-[1px] z-[9]">
      <TableRow>
        {headers.map(({ label, icon, className, colSpan }, index) => (
          <TableHead
            key={index}
            className={className}
            {...(colSpan ? { colSpan } : {})}
          >
            {icon ? (
              <div className="flex items-center gap-1">
                {icon}
                <div>{label}</div>
              </div>
            ) : (
              label
            )}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}

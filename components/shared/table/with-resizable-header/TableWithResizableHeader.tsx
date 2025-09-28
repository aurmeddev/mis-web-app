import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { flexRender, Table as TableType } from "@tanstack/react-table";

type Props = {
  className?: string;
  isHeaderSticky?: boolean;
  loadingRowIndexes?: Set<number>;
  table: TableType<any>;
};

export function TableWithResizableHeader({
  className,
  isHeaderSticky,
  loadingRowIndexes,
  table,
}: Props) {
  return (
    <Table className={className} style={{ width: table.getTotalSize() }}>
      <TableHeader
        className={cn("bg-muted", isHeaderSticky ? "sticky top-0" : "")}
      >
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                style={{ width: header.getSize() }}
                className="border-r relative"
              >
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )}
                {header.column.getCanResize() && (
                  <div
                    onMouseDown={header.getResizeHandler()}
                    onTouchStart={header.getResizeHandler()}
                    className="absolute right-0 top-0 h-full w-px cursor-col-resize select-none hover:bg-primary hover:w-1"
                  />
                )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => {
          const isLoading = loadingRowIndexes?.has(row.index);
          return (
            <TableRow
              key={row.id}
              className={cn(isLoading ? "animate-pulse bg-muted/50" : "")}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className="border-r"
                  style={{
                    width: cell.column.getSize(),
                    minWidth: cell.column.columnDef.minSize,
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

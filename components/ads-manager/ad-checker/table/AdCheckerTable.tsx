"use client";
import {
  ColumnSizingState,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { AdData, RefreshStates } from "../AdCheckerContainer";
import { useAdColumns } from "../column/useAdColumns";
import { useMemo, useState } from "react";
import { Pagination } from "@/components/shared/pagination/tanstack/Pagination";
import { TableWithResizableHeader } from "@/components/shared/table/with-resizable-header/TableWithResizableHeader";

type Props = {
  refreshStates: RefreshStates;
  tableData: AdData[];
  onViewCreatives: (adCreatives: any) => void;
  onRefresh: () => void;
};

export function AdCheckerTable({
  refreshStates,
  onRefresh,
  onViewCreatives,
  tableData,
}: Props) {
  const errorIndexes = useMemo(() => {
    return tableData
      .map((item, index) =>
        item.ad_checker_summary.message.includes("Facebook server error")
          ? index
          : -1
      )
      .filter((i) => i !== -1);
  }, [tableData]);

  const hasServerErrorData = errorIndexes.length > 0;
  const columns = useAdColumns({
    hasServerErrorData,
    onViewCreatives,
    onRefresh,
    refreshStates,
  });
  const [colSizing, setColSizing] = useState<ColumnSizingState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    id: false,
    disable_reason: false,
    account_status: false,
  });
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnSizingChange: setColSizing,
    onColumnVisibilityChange: setColumnVisibility,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    state: {
      pagination,
      columnSizing: colSizing,
      columnVisibility,
    },
  });

  return (
    <div className="flex flex-col overflow-auto w-full">
      <div className="border overflow-auto rounded w-full">
        <TableWithResizableHeader
          className="text-xs"
          isHeaderSticky={true}
          table={table}
        />
      </div>
      {tableData.length ? (
        <Pagination table={table} tableDataLength={tableData.length} />
      ) : (
        ""
      )}
    </div>
  );
}

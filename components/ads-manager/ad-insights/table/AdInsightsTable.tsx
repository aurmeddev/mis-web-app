"use client";
import {
  ColumnSizingState,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { AdInsightsData } from "../AdInsightsContainer";
import { useAdInsightsColumn } from "../column/useAdInsightsColumns";
import { useState } from "react";
import { Pagination } from "@/components/shared/pagination/tanstack/Pagination";
import { TableWithResizableHeader } from "@/components/shared/table/with-resizable-header/TableWithResizableHeader";

type Props = {
  tableData: AdInsightsData[];
};

export function AdInsightsTable({ tableData }: Props) {
  const columns = useAdInsightsColumn();
  const [colSizing, setColSizing] = useState<ColumnSizingState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    account_status: false,
    disable_reason: false,
    v_campaign_status: false,
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
        <TableWithResizableHeader className="text-xs" table={table} />
      </div>
      {tableData.length ? (
        <Pagination table={table} tableDataLength={tableData.length} />
      ) : (
        ""
      )}
    </div>
  );
}

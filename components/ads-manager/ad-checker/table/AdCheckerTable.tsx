"use client";
import {
  ColumnSizingState,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  AdData,
  DeleteRuleStates,
  PauseStates,
  RefreshStates,
} from "../AdCheckerContainer";
import { useAdColumns } from "../column/useAdColumns";
import { useMemo, useState } from "react";
import { Pagination } from "@/components/shared/pagination/tanstack/Pagination";
import { TableWithResizableHeader } from "@/components/shared/table/with-resizable-header/TableWithResizableHeader";

type Props = {
  deleteRuleStates: DeleteRuleStates;
  pauseStates: PauseStates;
  refreshStates: RefreshStates;
  tableData: AdData[];
  onPauseStatesChange: (isCountdownDone: boolean) => void;
  onViewCreatives: (adCreatives: any) => void;
  onRefresh: () => void;
  onPauseSusCamp: () => void;
  onRetryDeleteRule: () => void;
};

export function AdCheckerTable({
  deleteRuleStates,
  pauseStates,
  refreshStates,
  onPauseStatesChange,
  onRefresh,
  onViewCreatives,
  onPauseSusCamp,
  onRetryDeleteRule,
  tableData,
}: Props) {
  const adCheckerSummaryFBServerError = useMemo(() => {
    return tableData
      .map((item, index) =>
        item.ad_checker_summary?.message.includes("Facebook server error")
          ? index
          : -1
      )
      .filter((i) => i !== -1);
  }, [tableData]);

  const updateCampDeliveryStatusError = useMemo(() => {
    return tableData
      .map((item, index) =>
        item.update_campaign_delivery_status == "Facebook server error"
          ? index
          : -1
      )
      .filter((i) => i !== -1);
  }, [tableData]);
  //delete_ad_rules_status
  const deleteAdRulesStatusError = useMemo(() => {
    return tableData
      .map((item, index) =>
        item.delete_ad_rules_status == "Facebook server error" ? index : -1
      )
      .filter((i) => i !== -1);
  }, [tableData]);

  const hasAdCheckerSummaryFBServerError =
    adCheckerSummaryFBServerError.length > 0;
  const hasUpdateCampDeliveryStatusError =
    updateCampDeliveryStatusError.length > 0;
  const hasAdRulesStatusError = deleteAdRulesStatusError.length > 0;

  const serverErrors = {
    hasAdCheckerSummaryFBServerError,
    hasUpdateCampDeliveryStatusError,
    hasAdRulesStatusError,
  };

  const columns = useAdColumns({
    serverErrors,
    onPauseStatesChange,
    onViewCreatives,
    onRefresh,
    onPauseSusCamp,
    onRetryDeleteRule,
    deleteRuleStates,
    refreshStates,
    pauseStates,
  });
  const [colSizing, setColSizing] = useState<ColumnSizingState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    id: false,
    disable_reason: false,
    account_status: false,
    update_campaign_delivery_status: false,
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

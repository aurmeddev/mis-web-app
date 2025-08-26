import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  Calendar,
  CircleFadingPlus,
  CircleStop,
  FileText,
  SearchX,
  User2,
} from "lucide-react";
import { ManageApProfilesTableHeader } from "./ManageApProfilesTableHeader";
import { RowAddMode } from "./row-actions/RowAddMode";
import { Input } from "@/components/ui/input";
import { StatusSelect } from "../select/StatusSelect";
import { RowActions } from "./row-actions/RowActions";

type UserManagementTableProps = {
  data: any;
  form: any;
  addMode: boolean;
  editingRow: number | null;
  handleConfirm: (id: number) => void;
  handleEditChange: (id: number | null) => void;
  handleInputChange: (name: string, value: string) => void;
  handleStatusChange: (value: string) => void;
  isActionDisabled: boolean;
};

function BadgeStatus({ status }: { status: string }) {
  const statusMap: Record<string, { text: string; color: string }> = {
    active: { text: "Inactive", color: "bg-rose-500" },
    inactive: { text: "Active", color: "bg-green-500" },
  };

  const { text, color } = statusMap[status] || {
    text: "Available",
    color: "bg-gray-500",
  };

  return (
    <Badge variant="outline">
      <div className="flex items-center gap-1 px-1 py-1 w-full">
        <span className="relative flex h-2 w-2">
          <span
            className={cn("relative inline-flex rounded-full h-2 w-2", color)}
          />
        </span>
        <div>{text}</div>
      </div>
    </Badge>
  );
}

export function ManageApProfilesTable({
  data,
  form,
  addMode,
  editingRow,
  handleConfirm,
  handleEditChange,
  handleInputChange,
  handleStatusChange,
  isActionDisabled,
}: UserManagementTableProps) {
  const tableHeaders = [
    { label: "#", className: "border-r text-sm" },
    { label: "Profile", className: "border-r text-sm w-[15%]", colSpan: 1 },
    {
      label: "FB Account",
      className: "border-r text-sm ",
      colSpan: 1,
    },
    {
      label: "Remarks",
      icon: <FileText className="h-4 w-4" />,
      className: "border-r text-sm ",
      colSpan: 1,
    },
    {
      label: "Status",
      icon: <CircleFadingPlus className="h-4 w-4" />,
      className: "border-r text-sm w-[10%]",
      colSpan: 2,
    },
    {
      label: "Created by",
      icon: <User2 className="h-4 w-4" />,
      className: "border-r text-sm ",
      colSpan: 1,
    },
    {
      label: "Created at",
      icon: <Calendar className="h-4 w-4" />,
      className: "border-r text-sm ",
      colSpan: 1,
    },
    {
      label: "Actions",
      icon: <CircleStop className="h-4 w-4" />,
      className: "text-sm",
      colSpan: 1,
    },
  ];
  return (
    <Table className="border-t border-r-0 table-auto">
      <ManageApProfilesTableHeader headers={tableHeaders} />
      <TableBody>
        {addMode && (
          <RowAddMode
            form={form}
            handleConfirm={handleConfirm}
            onInputChange={handleInputChange}
            onStatusChange={handleStatusChange}
            handleEditChange={handleEditChange}
            isActionDisabled={isActionDisabled}
          />
        )}

        {!data?.length && (
          <TableRow className="bg-muted">
            <TableCell className="py-0 text-center" colSpan={11}>
              <div className="flex flex-col gap-2 items-center py-4">
                <SearchX className="h-10 w-10 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  No matching results found.
                </div>
              </div>
            </TableCell>
          </TableRow>
        )}

        {data.map((rowData: any, idx: number) => {
          const isEditing = editingRow === rowData.id;
          return (
            <TableRow key={idx}>
              <TableCell className="border-r font-medium text-sm max-w-[10%]">
                {rowData.row_id}
              </TableCell>
              <TableCell className="border-r text-sm">
                {isEditing ? (
                  <Input
                    autoFocus
                    className="border h-8 px-2 py-0 rounded w-full"
                    disabled={isActionDisabled}
                    value={form.profile_name}
                    onChange={(e) =>
                      handleInputChange("profile_name", e.target.value)
                    }
                  />
                ) : (
                  rowData.profile_name
                )}
              </TableCell>
              <TableCell className="border-r text-sm">
                {isEditing ? (
                  <Input
                    className="border h-8 px-2 py-0 rounded w-full"
                    disabled={isActionDisabled}
                    value={form.fb_owner_name}
                    onChange={(e) =>
                      handleInputChange("fb_owner_name", e.target.value)
                    }
                  />
                ) : (
                  rowData.fb_account.fb_owner_name
                )}
              </TableCell>
              <TableCell className="border-r text-sm">
                {rowData.remarks}
              </TableCell>
              <TableCell
                className="border-r font-medium py-0 text-sm"
                colSpan={2}
              >
                {isEditing ? (
                  <StatusSelect
                    value={String(form.is_active) || String(rowData.is_active)}
                    onChange={handleStatusChange}
                    isDisabled={isActionDisabled}
                  />
                ) : (
                  <BadgeStatus status={rowData.status} />
                )}
              </TableCell>
              <TableCell className="border-r text-sm">
                <div className="text-xs">{rowData.created_by.full_name}</div>
                <div className="text-xs text-muted-foreground">
                  {rowData.created_by.team_name}
                </div>
              </TableCell>
              <TableCell className="border-r text-sm">
                {rowData.created_at}
              </TableCell>
              <TableCell>
                <div className="flex justify-center gap-2 text-center">
                  <RowActions
                    id={rowData.id}
                    isEditing={isEditing}
                    onConfirm={handleConfirm}
                    onEditChange={handleEditChange}
                    isActionDisabled={isActionDisabled}
                  />
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

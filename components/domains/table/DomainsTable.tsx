import { TableBody, Table, TableRow, TableCell } from "@/components/ui/table";
import { RowAddMode } from "./row-actions/RowAddMode";
import { AddDomainRecordRaw } from "./DomainsTableContainer";
import { StatusSelect } from "../select/StatusSelect";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Calendar,
  CircleFadingPlus,
  CircleStop,
  SearchX,
  User2,
} from "lucide-react";
import { Header } from "@/components/table/header/Header";
import { RowActions } from "@/components/user-management/table/row-actions/RowActions";

type DomainsTableProps = {
  data: AddDomainRecordRaw[];
  form: AddDomainRecordRaw;
  addMode: boolean;
  editingRow: number | null;
  handleConfirm: (id: number) => void;
  handleEditChange: (id: number | null) => void;
  handleInputChange: (name: string, value: string) => void;
  handleStatusChange: (value: string) => void;
  isActionDisabled: boolean;
};

function BadgeStatus({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={"outline"}>
      <div className="flex items-center gap-1 px-1 py-1 w-full">
        <span className="relative flex h-2 w-2">
          <span
            className={cn(
              "relative inline-flex rounded-full h-2 w-2",
              isActive ? "bg-emerald-500" : "bg-rose-500"
            )}
          ></span>
        </span>
        <div>{isActive ? "Active" : "Inactive"}</div>
      </div>
    </Badge>
  );
}

export function DomainsTable({
  data,
  form,
  addMode,
  editingRow,
  handleConfirm,
  handleEditChange,
  handleInputChange,
  handleStatusChange,
  isActionDisabled,
}: DomainsTableProps) {
  const tableHeaders = [
    { label: "#", className: "border-r w-[4%]" },
    { label: "Domain Name", className: "border-r w-[30%]" },
    {
      label: "Status",
      icon: <CircleFadingPlus className="h-4 w-4" />,
      className: "border-r w-[15%]",
      colSpan: 2,
    },
    {
      label: "Created By",
      icon: <User2 className="h-4 w-4" />,
      className: "border-r w-1/5",
    },
    {
      label: "Date Created",
      icon: <Calendar className="h-4 w-4" />,
      className: "border-r w-1/4",
    },
    {
      label: "Actions",
      icon: <CircleStop className="h-4 w-4" />,
      className: "w-[15%]",
    },
  ];
  return (
    <Table className="border-t border-r-0 table-fixed">
      <Header headers={tableHeaders} />
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

        {!data.length && (
          <TableRow>
            <TableCell className="border-r py-0 text-center" colSpan={9}>
              <div className="flex flex-col gap-2 items-center py-4">
                <SearchX className="h-10 w-10 text-muted-foreground" />
                <div className="text-base text-muted-foreground">
                  No matching results found.
                </div>
              </div>
            </TableCell>
          </TableRow>
        )}

        {data.map((rowData: AddDomainRecordRaw, idx: number) => {
          const isEditing = editingRow === rowData.id;

          return (
            <TableRow key={rowData.id}>
              <TableCell className="border-r w-[10%]">
                {rowData.row_id ? (
                  rowData.row_id
                ) : (
                  <div className="text-green-500 text-[.6rem] uppercase">
                    New
                  </div>
                )}
              </TableCell>
              <TableCell className="border-r font-medium">
                {isEditing ? (
                  <Input
                    autoFocus
                    className="border h-8 px-2 py-0 rounded w-full"
                    disabled={isActionDisabled}
                    value={form.domain_name}
                    onChange={(e) =>
                      handleInputChange("domain_name", e.target.value)
                    }
                  />
                ) : (
                  rowData.domain_name
                )}
              </TableCell>

              <TableCell className="border-r py-0" colSpan={2}>
                {isEditing ? (
                  <StatusSelect
                    value={String(form.status) || String(rowData.status)}
                    onChange={handleStatusChange}
                    isDisabled={isActionDisabled}
                  />
                ) : (
                  <BadgeStatus isActive={rowData.status == "active"} />
                )}
              </TableCell>
              <TableCell className="border-r text-xs">
                <div>{rowData.created_by.full_name}</div>
                <div className="text-muted-foreground">
                  {rowData.created_by.team_name}
                </div>
              </TableCell>
              <TableCell className="border-r">{rowData.created_at}</TableCell>
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

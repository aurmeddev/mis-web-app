import { TableBody, Table, TableRow, TableCell } from "@/components/ui/table";
import { UserManagementTableHeader } from "./UserManagementTableHeader";
import { RowAddMode } from "./row-actions/RowAddMode";
import { WhitelistRecordRaw } from "./UserManagementTableContainer";
import { StatusSelect } from "../select/StatusSelect";
import { RowActions } from "./row-actions/RowActions";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Calendar,
  CircleFadingPlus,
  CircleStop,
  Globe,
  SearchX,
} from "lucide-react";

type UserManagementTableProps = {
  data: WhitelistRecordRaw[];
  form: WhitelistRecordRaw;
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

export function UserManagementTable({
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
    { label: "#", className: "border-r w-[3%]" },
    { label: "Name", className: "border-r w-[30%]" },
    {
      label: "IP Address",
      icon: <Globe className="h-4 w-4" />,
      className: "border-r w-[40%]",
    },
    {
      label: "Status",
      icon: <CircleFadingPlus className="h-4 w-4" />,
      className: "border-r w-[10%]",
      colSpan: 2,
    },
    {
      label: "Date Created",
      icon: <Calendar className="h-4 w-4" />,
      className: "border-r w-1/3",
    },
    {
      label: "Actions",
      icon: <CircleStop className="h-4 w-4" />,
      className: "w-[10%]",
    },
  ];
  return (
    <Table className="border-t border-r-0 table-fixed">
      <UserManagementTableHeader headers={tableHeaders} />
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

        {data.map((rowData: WhitelistRecordRaw, idx: number) => {
          const isEditing = editingRow === rowData.id;

          return (
            <TableRow key={idx}>
              <TableCell className="border-r w-[10%]">{idx + 1}</TableCell>
              <TableCell className="border-r font-medium">
                {isEditing ? (
                  <Input
                    autoFocus
                    className="border h-8 px-2 py-0 rounded w-full"
                    disabled={isActionDisabled}
                    value={form.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                ) : (
                  rowData.name
                )}
              </TableCell>

              <TableCell className="border-r">
                {isEditing ? (
                  <Input
                    className="border h-8 px-2 py-0 rounded w-full"
                    disabled={isActionDisabled}
                    value={form.ip_address}
                    onChange={(e) =>
                      handleInputChange("ip_address", e.target.value)
                    }
                  />
                ) : (
                  rowData.ip_address
                )}
              </TableCell>

              <TableCell className="border-r py-0" colSpan={2}>
                {isEditing ? (
                  <StatusSelect
                    value={String(form.is_active) || String(rowData.is_active)}
                    onChange={handleStatusChange}
                    isDisabled={isActionDisabled}
                  />
                ) : (
                  <BadgeStatus isActive={rowData.is_active === 1} />
                )}
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

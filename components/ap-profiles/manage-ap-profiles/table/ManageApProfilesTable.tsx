import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  CircleFadingPlus,
  CircleStop,
  FileText,
  Lock,
  SearchX,
  ShieldCheck,
  User,
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
    "0": { text: "Inactive", color: "bg-rose-500" },
    "1": { text: "Active", color: "bg-green-500" },
  };

  const { text, color } = statusMap[status] || {
    text: "New",
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
    { label: "#", className: "border-r text-sm w-[3%] max-w-[20px] truncate" },
    { label: "Profile", className: "border-r text-sm w-[15%]", colSpan: 1 },
    {
      label: "Recruiters",
      className: "border-r text-sm ",
      colSpan: 1,
    },
    {
      label: "FB Name",
      className: "border-r text-sm ",
      colSpan: 1,
    },
    {
      label: "Username/Email",
      icon: <User className="h-4 w-4" />,
      className: "border-r text-sm ",
      colSpan: 1,
    },
    {
      label: "Password",
      icon: <Lock className="h-4 w-4" />,
      className: "border-r text-sm ",
      colSpan: 1,
    },
    {
      label: "2FA Key",
      icon: <ShieldCheck className="h-4 w-4" />,
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

        {data.map((rowData: any, idx: number) => {
          const isEditing = editingRow === rowData.id;

          return (
            <TableRow key={idx}>
              <TableCell className="border-r font-medium text-sm w-[10%]">
                {idx + 1}
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
                    autoFocus
                    className="border h-8 px-2 py-0 rounded w-full"
                    disabled={isActionDisabled}
                    value={form.full_name}
                    onChange={(e) =>
                      handleInputChange("full_name", e.target.value)
                    }
                  />
                ) : (
                  rowData.created_by.full_name
                )}
              </TableCell>
              <TableCell className="border-r text-sm">
                {isEditing ? (
                  <Input
                    autoFocus
                    className="border h-8 px-2 py-0 rounded w-full"
                    disabled={isActionDisabled}
                    value={form.fb_owner_name}
                    onChange={(e) =>
                      handleInputChange("fb_owner_name", e.target.value)
                    }
                  />
                ) : (
                  rowData.fb_owner_name
                )}
              </TableCell>
              <TableCell className="border-r text-sm">
                {isEditing ? (
                  <Input
                    autoFocus
                    className="border h-8 px-2 py-0 rounded w-full"
                    disabled={isActionDisabled}
                    value={form.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                  />
                ) : (
                  rowData.username
                )}
              </TableCell>

              <TableCell className="border-r text-sm">
                {isEditing ? (
                  <Input
                    className="border h-8 px-2 py-0 rounded w-full"
                    disabled={isActionDisabled}
                    value={form.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                  />
                ) : (
                  rowData.password
                )}
              </TableCell>
              <TableCell className="border-r text-sm">
                {isEditing ? (
                  <Input
                    className="border h-8 px-2 py-0 rounded w-full"
                    disabled={isActionDisabled}
                    value={form.long_2fa_key}
                    onChange={(e) =>
                      handleInputChange("long_2fa_key", e.target.value)
                    }
                  />
                ) : (
                  rowData.long_2fa_key
                )}
              </TableCell>

              <TableCell className="border-r text-sm">
                {isEditing ? (
                  <Input
                    className="border h-8 px-2 py-0 rounded w-full"
                    disabled={isActionDisabled}
                    value={form.remarks}
                    onChange={(e) =>
                      handleInputChange("remarks", e.target.value)
                    }
                  />
                ) : (
                  rowData.remarks
                )}
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
                  <BadgeStatus status={rowData.is_active} />
                )}
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

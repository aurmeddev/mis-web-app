import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  Calendar,
  CircleFadingPlus,
  CircleStop,
  KeySquare,
  Lock,
  Pencil,
  SearchX,
  ShieldEllipsis,
  User2,
  UserCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/table/header/Header";

type FbAccountsTableProps = {
  data: any;
  handleEditChange: (id: number) => void;
};

function BadgeStatus({ status }: { status: string }) {
  const statusMap: Record<string, { text: string; color: string }> = {
    inactive: { text: "Inactive", color: "bg-rose-500" },
    active: { text: "Active", color: "bg-green-500" },
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

export function FbAccountsTable({
  data,
  handleEditChange,
}: FbAccountsTableProps) {
  const tableHeaders = [
    { label: "#", className: "border-r text-sm" },
    { label: "FB Account", className: "border-r text-sm w-[15%]", colSpan: 1 },
    { label: "Profile", className: "border-r text-sm w-[15%]", colSpan: 1 },
    {
      label: "Email",
      className: "border-r text-sm ",
      colSpan: 1,
    },
    {
      label: "Contact No",
      className: "border-r text-sm ",
      colSpan: 1,
    },
    {
      label: "Username",
      icon: <UserCircle className="h-4 w-4" />,
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
      icon: <ShieldEllipsis className="h-4 w-4" />,
      className: "border-r text-sm ",
      colSpan: 1,
    },
    {
      label: "Recovery Code",
      icon: <KeySquare className="h-4 w-4" />,
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
      label: "Recruited by",
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
      <Header headers={tableHeaders} />
      <TableBody className="overflow-auto">
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

        {data.map((rowData: any, idx: number) => (
          <TableRow key={idx}>
            <TableCell className="border-r font-medium text-sm max-w-[10%]">
              {rowData.row_id}
            </TableCell>
            <TableCell className="border-r text-sm">
              {rowData.fb_owner_name}
            </TableCell>
            <TableCell className="border-r text-sm">
              {rowData.ap_profile?.profile_name || ""}
            </TableCell>
            <TableCell className="border-r text-sm">
              {rowData.email_address}
            </TableCell>
            <TableCell className="border-r text-sm">
              {rowData.contact_no}
            </TableCell>
            <TableCell className="border-r text-sm">
              {rowData.username}
            </TableCell>
            <TableCell className="border-r text-sm">
              {rowData.password}
            </TableCell>
            <TableCell className="border-r text-sm">
              <div className="font-semibold">
                {rowData.app_2fa_key ? "********" : ""}
              </div>
            </TableCell>
            <TableCell className="border-r text-sm">
              {rowData.recovery_code}
            </TableCell>
            <TableCell
              className="border-r font-medium py-0 text-sm"
              colSpan={2}
            >
              <BadgeStatus status={rowData.status} />
            </TableCell>
            <TableCell className="border-r text-sm">
              <div className="text-xs">{rowData.recruited_by.full_name}</div>
              <div className="text-xs text-muted-foreground">
                {rowData.recruited_by.team_name}
              </div>
            </TableCell>
            <TableCell className="border-r text-sm">
              {rowData.created_at}
            </TableCell>
            <TableCell>
              <div className="flex justify-center gap-2 text-center">
                <Button
                  className="cursor-pointer h-7 py-0 px-3"
                  variant="outline"
                  onClick={() => handleEditChange(rowData.id)}
                >
                  <Pencil style={{ height: "14px", width: "14px" }} /> Edit
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

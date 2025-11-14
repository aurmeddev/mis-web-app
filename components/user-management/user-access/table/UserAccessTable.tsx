import { TableBody, Table, TableRow, TableCell } from "@/components/ui/table";
import {
  AtSign,
  ChevronDown,
  CircleFadingPlus,
  CircleStop,
  Info,
  SearchX,
  UserPen,
  UserRoundCog,
} from "lucide-react";
import { Header } from "@/components/shared/table/header/Header";
import { UserAccessRecordRaw, UserAccessTableProps } from "../UserAccess.types";
import { StatusCell } from "./cell/StatusCell";
import { EditOptionsMemo } from "./row-actions/EditOptions";
import React from "react";

const tableHeaders = [
  { label: "#", className: "border-r w-[4%]" },
  { label: "Name", className: "border-r w-[20%]" },
  {
    label: "Email",
    icon: <AtSign className="h-4 w-4" />,
    className: "border-r w-[25%]",
    colSpan: 1,
  },
  {
    label: "Status",
    icon: <CircleFadingPlus className="h-4 w-4" />,
    className: "border-r w-[12%]",
    colSpan: 2,
  },
  {
    label: "Account Type",
    icon: <Info className="h-4 w-4" />,
    className: "border-r w-[12%]",
  },
  {
    label: "Actions",
    icon: <CircleStop className="h-4 w-4" />,
    className: "w-[15%]",
  },
];

function UserAccessTable({
  data,
  onEditChange,
  onConfirmStatus,
  onEditStatus,
  statusState,
}: UserAccessTableProps) {
  return (
    <Table className="border-t border-r-0 table-fixed">
      <Header headers={tableHeaders} />
      <TableBody>
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

        {data.map((rowData: UserAccessRecordRaw) => {
          return (
            <TableRow className="group" key={rowData.id}>
              <TableCell className="border-r text-center w-[10%]">
                {rowData.row_id ? (
                  rowData.row_id
                ) : (
                  <div className="text-green-500 text-[.6rem] uppercase">
                    New
                  </div>
                )}
              </TableCell>
              <TableCell className="border-r text-xs">
                <div>
                  <span className="text-muted-foreground">Full name: </span>
                  {rowData.full_name}
                </div>
                <div>
                  <span className="text-muted-foreground">Display name: </span>
                  {rowData.display_name}
                </div>
              </TableCell>
              <TableCell className="border-r text-sm truncate">
                {rowData.email}
              </TableCell>
              <TableCell
                className="bg-white! border-r dark:bg-transparent! py-0 relative"
                colSpan={2}
              >
                <StatusCell
                  rowData={rowData}
                  statusState={statusState}
                  onConfirmStatus={onConfirmStatus}
                  onEditStatus={onEditStatus}
                />
              </TableCell>
              <TableCell className="border-r text-xs">
                <div>{rowData.user_type_name}</div>
                <div className="text-muted-foreground">{rowData.team_name}</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-2 text-center">
                  <EditOptionsMemo
                    onEditOptionSelection={
                      (type) => onEditChange(rowData.id, type)
                      // onEditOptionSelection(type, rowData.id)
                    }
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

export const UserAccessTableMemo = React.memo(UserAccessTable);

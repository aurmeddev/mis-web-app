import { TableBody, Table, TableRow, TableCell } from "@/components/ui/table";
import { UserAccessRecordRaw } from "./UserAccessTableContainer";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AtSign,
  CircleFadingPlus,
  CircleStop,
  Info,
  Pencil,
  SearchX,
  Settings2,
} from "lucide-react";
import { Header } from "@/components/shared/table/header/Header";
import { Button } from "@/components/ui/button";

type Props = {
  data: UserAccessRecordRaw[];
  editingRow: string;
  handleEditChange: (id: string) => void;
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

export function UserAccessTable({ data, editingRow, handleEditChange }: Props) {
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
      className: "border-r w-[15%]",
      colSpan: 2,
    },
    {
      label: "User Info",
      icon: <Info className="h-4 w-4" />,
      className: "border-r w-[20%]",
    },
    {
      label: "Actions",
      icon: <CircleStop className="h-4 w-4" />,
      className: "lg:w-[25%] w-[35%]",
    },
  ];
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
            <TableRow key={rowData.id}>
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
                <div>{rowData.full_name}</div>
                <div className="text-muted-foreground">
                  {rowData.display_name}
                </div>
              </TableCell>
              <TableCell className="border-r text-sm truncate">
                {rowData.email}
              </TableCell>
              <TableCell className="border-r py-0" colSpan={2}>
                {/* {isEditing ? (
                  <StatusSelect
                    value={String(form.status) || String(rowData.status)}
                    onChange={handleStatusChange}
                    isDisabled={isActionDisabled}
                  />
                ) : (
                )} */}
                <BadgeStatus isActive={rowData.status == "active"} />
              </TableCell>
              <TableCell className="border-r text-xs">
                <div>{rowData.user_type_name}</div>
                <div className="text-muted-foreground">{rowData.team_name}</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-center gap-2 text-center">
                  <Button
                    className="cursor-pointer py-0 px-3"
                    variant="outline"
                    onClick={() => handleEditChange(rowData.id)}
                    size={"sm"}
                  >
                    {rowData.id == editingRow ? (
                      "Editing"
                    ) : (
                      <>
                        <Pencil className="mr-0 h-4 w-4" /> Edit
                      </>
                    )}
                  </Button>
                  <Button
                    className="cursor-pointer py-0 px-3"
                    variant="outline"
                    onClick={() => handleEditChange(rowData.id)}
                    size={"sm"}
                  >
                    <Settings2 className="mr-0 h-4 w-4" /> View Access
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

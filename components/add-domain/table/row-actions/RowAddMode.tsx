import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { StatusSelect } from "../../select/StatusSelect";
import { AddDomainRecordRaw } from "../AddDomainTableContainer";
import { RowActions } from "@/components/user-management/table/row-actions/RowActions";

type RowAddModeProps = {
  form: AddDomainRecordRaw;
  onInputChange: (name: string, value: string) => void;
  onStatusChange: (value: string) => void;
  handleConfirm: (id: number) => void;
  handleEditChange: (id: number | null) => void;
  isActionDisabled: boolean;
};

export function RowAddMode({
  form,
  onInputChange,
  onStatusChange,
  handleConfirm,
  handleEditChange,
  isActionDisabled,
}: RowAddModeProps) {
  return (
    <TableRow key={"table-add"}>
      <TableCell className="border-r">
        <div className="bg-muted h-7 rounded w-full"></div>
      </TableCell>
      <TableCell className="border-r font-medium">
        <Input
          autoFocus
          className="border h-8 px-2 py-0 rounded w-full"
          value={form?.domain_name || ""}
          onChange={(e) => onInputChange("domain_name", e.target.value)}
        />
      </TableCell>
      <TableCell className="border-r" colSpan={2}>
        <StatusSelect
          value={String(form?.status || "active")}
          onChange={onStatusChange}
          isDisabled={true}
        />
      </TableCell>
      <TableCell className="border-r">
        <div className="bg-muted h-7 rounded w-full"></div>
      </TableCell>
      <TableCell className="border-r">
        <div className="bg-muted h-7 rounded w-full"></div>
      </TableCell>
      <TableCell>
        <div className="flex justify-center gap-2 text-center">
          <RowActions
            id={0}
            isEditing={true}
            onConfirm={handleConfirm}
            onEditChange={handleEditChange}
            isActionDisabled={isActionDisabled}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}

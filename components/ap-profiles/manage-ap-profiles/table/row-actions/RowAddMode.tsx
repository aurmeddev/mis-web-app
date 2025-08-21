import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { RowActions } from "./RowActions";
import { StatusSelect } from "../../select/StatusSelect";

type RowAddModeProps = {
  form: any;
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
          value={form?.profile_name || ""}
          onChange={(e) => onInputChange("profile_name", e.target.value)}
        />
      </TableCell>
      <TableCell className="border-r font-medium">
        <Input
          className="border h-8 px-2 py-0 rounded w-full"
          value={form?.username || ""}
          onChange={(e) => onInputChange("username", e.target.value)}
        />
      </TableCell>
      <TableCell className="border-r font-medium">
        <Input
          className="border h-8 px-2 py-0 rounded w-full"
          value={form?.password || ""}
          onChange={(e) => onInputChange("password", e.target.value)}
        />
      </TableCell>
      <TableCell className="border-r">
        <Input
          className="border h-8 px-2 py-0 rounded w-full"
          value={form?.long_2fa_key || ""}
          onChange={(e) => onInputChange("long_2fa_key", e.target.value)}
        />
      </TableCell>
      <TableCell className="border-r" colSpan={2}>
        <StatusSelect
          value={String(form?.is_active || "1")}
          onChange={onStatusChange}
          isDisabled={true}
        />
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

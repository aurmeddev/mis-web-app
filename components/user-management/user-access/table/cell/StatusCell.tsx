import { Button } from "@/components/ui/button";
import { CheckIcon, X, Pencil } from "lucide-react";
import { StatusCellProps } from "../../UserAccess.types";
import { StatusSelect } from "@/components/shared/select/StatusSelect";
import { MemoizedBadgeStatus } from "@/components/shared/badge/BadgeStatus";

export const StatusCell = ({
  rowData,
  statusState,
  onEditStatus,
  onConfirmStatus,
}: StatusCellProps) => {
  const isEditingThisRow =
    statusState.isEditing && rowData.id === statusState.id;

  return (
    <>
      {isEditingThisRow ? (
        <div className="relative z-9">
          {/* Editing State */}
          <StatusSelect
            className="font-[500] text-xs w-full"
            value={statusState.isActive ? "active" : "inactive"}
            onChange={(value) => onEditStatus(rowData.id, value === "active")}
            isDisabled={false}
          />
          <div className="*:cursor-pointer *:h-7 *:py-0 *:px-3 *:text-xs absolute flex flex-col gap-2 bg-white top-[100%] px-1 py-3 w-full">
            <Button
              variant="default"
              onClick={() => onConfirmStatus(rowData.id, statusState.isActive)}
              disabled={statusState.isSubmitting}
            >
              Proceed
            </Button>
            <Button
              variant="destructive"
              onClick={() => onEditStatus("", false)}
              disabled={statusState.isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        // Display State
        <div className="flex group items-center justify-between">
          <MemoizedBadgeStatus isActive={rowData.status === "active"} />
          <Pencil
            onClick={() =>
              onEditStatus(rowData.id, rowData.status === "active")
            }
            className="cursor-pointer hidden group-hover:block text-muted-foreground w-4"
          />
        </div>
      )}
    </>
  );
};

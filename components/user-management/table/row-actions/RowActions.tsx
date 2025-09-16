import { Button } from "@/components/ui/button";
import { CheckIcon, Pencil, X } from "lucide-react";

type RowActionsProps = {
  id: number;
  isEditing: boolean;
  onConfirm: (id: number) => void;
  onEditChange: (id: number | null) => void;
  isActionDisabled: boolean;
};

export function RowActions({
  id,
  isEditing,
  onConfirm,
  onEditChange,
  isActionDisabled,
}: RowActionsProps) {
  return isEditing ? (
    <>
      <Button
        className="cursor-pointer h-7 py-0 px-3"
        variant="default"
        onClick={() => onConfirm(id)}
        disabled={isActionDisabled}
      >
        <CheckIcon />
      </Button>
      <Button
        className="cursor-pointer h-7 py-0 px-3"
        variant="destructive"
        onClick={() => onEditChange(null)}
        disabled={isActionDisabled}
      >
        <X />
      </Button>
    </>
  ) : (
    <Button
      className="cursor-pointer h-7 py-0 px-3"
      variant="outline"
      onClick={() => onEditChange(id)}
    >
      <Pencil className="mr-1 h-4 w-4" /> Edit
    </Button>
  );
}

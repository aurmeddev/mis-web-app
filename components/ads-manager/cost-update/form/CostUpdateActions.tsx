import { Button } from "@/components/ui/button";
import { ICostUpdateActions } from "../CostUpdate.types";

export function CostUpdateActions({
  hasNotUploaded,
  isSubmitting,
  onClear,
}: ICostUpdateActions) {
  return (
    <div className="flex gap-2 justify-end">
      <Button
        className="cursor-pointer"
        type="button"
        variant={"outline"}
        onClick={onClear}
      >
        Clear
      </Button>
      <Button
        className="cursor-pointer"
        disabled={hasNotUploaded || isSubmitting}
      >
        Update Cost
      </Button>
    </div>
  );
}

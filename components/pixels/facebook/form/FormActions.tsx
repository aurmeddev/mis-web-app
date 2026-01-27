import { Button } from "@/components/ui/button";
import { IFormActions } from "../Facebook.types";

export function FormActions({
  isOnConfirmationMode,
  isSubmitting,
  isUpdateMode,
  onFormReset,
}: IFormActions) {
  return (
    <div className="flex justify-end space-x-4">
      <Button onClick={onFormReset} type="button" variant="outline">
        Clear
      </Button>
      <Button
        className="cursor-pointer"
        disabled={isSubmitting || isOnConfirmationMode}
        type="submit"
      >
        {isUpdateMode ? "Update Pixel" : "Add Pixel"}
      </Button>
    </div>
  );
}

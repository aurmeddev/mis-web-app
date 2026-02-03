import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle } from "lucide-react";
import { IPixelInput } from "../Facebook.types";

export function PixelInput({
  formState,
  isOnConfirmationMode,
  onPixelFormChange,
  onProceed,
  pixelFormData,
}: IPixelInput) {
  const isPixelExisted =
    formState.isExisted &&
    pixelFormData.pixel.length > 0 &&
    !formState.canProceed;
  return (
    <div className="grid gap-4">
      <div className="relative space-y-2">
        <Label htmlFor="pixel">Pixel</Label>
        <div className="relative">
          <Input
            disabled={isOnConfirmationMode || formState.canProceed}
            id="pixel"
            onChange={(ev) => onPixelFormChange("pixel", ev.target.value)}
            placeholder="Enter the Pixel ID"
            required
            value={pixelFormData.pixel}
          />
          {!formState.isExisted && pixelFormData.pixel && (
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <CheckCircle className="h-4 text-green-500" />
            </div>
          )}
        </div>
        {isPixelExisted && (
          <div className="text-red-500 text-sm">
            A pixel with this ID already exists. Would you like to proceed with
            updating the pixel or token?{" "}
            <span
              className="cursor-pointer hover:underline text-blue-500"
              onClick={onProceed}
            >
              Click here to proceed
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

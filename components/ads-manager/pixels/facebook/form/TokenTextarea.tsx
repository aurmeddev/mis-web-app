import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TokenTextareaProps } from "../Facebook.types";

export function TokenTextarea({
  isOnConfirmationMode,
  onPixelFormChange,
  token,
}: TokenTextareaProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="token">Access Token</Label>
      <Textarea
        disabled={isOnConfirmationMode}
        id="token"
        className="h-fit min-h-24"
        onChange={(ev) => onPixelFormChange("token", ev.target.value)}
        placeholder="Enter Access Token"
        rows={12}
        value={token}
      />
    </div>
  );
}

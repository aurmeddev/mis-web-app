import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { DialogProgressProps } from "./DialogProgress.types";
import { ProgressUtils } from "@/lib/utils/progress/ProgressUtils";

export function DialogProgress({
  onOpen,
  itemsLength,
  open,
  progress,
  texts,
}: DialogProgressProps) {
  const currentProgressPosition = ProgressUtils.getPositionFromPercentage(
    progress,
    itemsLength
  );
  return (
    <Dialog open={open} onOpenChange={onOpen}>
      <DialogContent
        onEscapeKeyDown={(ev) => ev.preventDefault()}
        onInteractOutside={(ev) => ev.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>
            {texts.actionType} {texts.currentItemTitle}...
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <div className="relative w-full">
          <Progress value={progress} className="w-full" />

          <div className="flex font-semibold justify-between mt-2 text-muted-foreground text-xs">
            <div>
              {currentProgressPosition + 1} of {itemsLength} {texts.itemsLabel}
              This may take a few moments.
            </div>
            <div>{progress}%</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

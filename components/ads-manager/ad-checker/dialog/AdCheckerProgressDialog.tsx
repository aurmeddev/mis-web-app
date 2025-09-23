import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { getPositionFromPercentage } from "../AdCheckerSidebar";
type Props = {
  open: boolean;
  handleOpen: (open: boolean) => void;
  profile: string;
  progress: number;
  profilesLength: number;
};

export function AdCheckerProgressDialog({
  open,
  handleOpen,
  profile,
  progress,
  profilesLength,
}: Props) {
  const currentProgressPosition = getPositionFromPercentage(
    progress,
    profilesLength
  );

  const progressPosition =
    currentProgressPosition == profilesLength
      ? currentProgressPosition
      : currentProgressPosition + 1;
  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent
        onEscapeKeyDown={(ev) => ev.preventDefault()}
        onInteractOutside={(ev) => ev.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>Checking {profile}...</DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <div className="relative w-full">
          <Progress value={progress} className="w-full" />

          <div className="flex font-semibold justify-between mt-2 text-muted-foreground text-xs">
            <div>
              {progressPosition} of {profilesLength} profiles. This may take a
              few moments.
            </div>
            <div>{progress}%</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

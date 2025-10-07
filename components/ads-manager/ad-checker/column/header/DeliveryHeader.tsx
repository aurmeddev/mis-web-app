import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Pause } from "lucide-react";
import { PauseStates } from "../../AdCheckerContainer";
import { useEffect, useState } from "react";
import { useAdCheckerContext } from "@/context/ad-checker/AdCheckerContext";

type Props = {
  hasUpdateCampDeliveryStatusError: boolean;
  onPauseStatesChange: (isCountdownDone: boolean) => void;
  onPauseSusCamp: () => void;
  pauseStates: PauseStates;
};

export function DeliveryHeader({
  hasUpdateCampDeliveryStatusError,
  onPauseStatesChange,
  onPauseSusCamp,
  pauseStates,
}: Props) {
  const { isSuperAdmin } = useAdCheckerContext();
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);
  let interval: NodeJS.Timeout;

  useEffect(() => {
    if (secondsRemaining == 0) {
      onPauseStatesChange(true);
    }
  }, [secondsRemaining]);

  useEffect(() => {
    if (pauseStates.isCountingDown) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev == 0) return prev;
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [pauseStates.isCountingDown]);

  return (
    <div className="flex items-center justify-between gap-2">
      <div>Delivery</div>
      {hasUpdateCampDeliveryStatusError && isSuperAdmin && (
        <Badge
          className={cn(
            pauseStates.canPause
              ? "cursor-pointer text-xs"
              : "pointer-events-none opacity-50"
          )}
          onClick={onPauseSusCamp}
        >
          {pauseStates.isCountingDown ? (
            <div>({secondsRemaining})</div>
          ) : (
            <Pause />
          )}
          Retry Pause Suspicious Campaign
        </Badge>
      )}
    </div>
  );
}

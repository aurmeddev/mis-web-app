import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { DeleteRuleStates } from "../../AdCheckerContainer";
import { useAdCheckerContext } from "@/context/ad-checker/AdCheckerContext";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  deleteRuleStates: DeleteRuleStates;
  hasAdAccountStatusError: boolean;
  onRetryDeleteRule: () => void;
};

export function AdAccountHeader({
  deleteRuleStates,
  hasAdAccountStatusError,
  onRetryDeleteRule,
}: Props) {
  const { isSuperAdmin } = useAdCheckerContext();
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);
  let interval: NodeJS.Timeout;

  useEffect(() => {
    if (secondsRemaining == 0) {
      //   onPauseStatesChange(true);
    }
  }, [secondsRemaining]);

  useEffect(() => {
    if (deleteRuleStates.isCountingDown) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev == 0) return prev;
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [deleteRuleStates.isCountingDown]);

  return (
    <div className="flex items-center justify-between gap-2">
      <div>Ad Account</div>
      {hasAdAccountStatusError && isSuperAdmin && (
        <Badge
          className={cn(
            deleteRuleStates.canDelete
              ? "cursor-pointer text-xs"
              : "pointer-events-none opacity-50"
          )}
          onClick={onRetryDeleteRule}
        >
          {deleteRuleStates.isCountingDown ? (
            <div>({secondsRemaining})</div>
          ) : (
            <Trash2 />
          )}
          Retry Delete Rule
        </Badge>
      )}
    </div>
  );
  //   return <Badge>Retry Delete Rule</Badge>;
}

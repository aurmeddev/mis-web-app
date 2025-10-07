import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RefreshCcw } from "lucide-react";
import { RefreshStates } from "../../AdCheckerContainer";
import { useAdCheckerContext } from "@/context/ad-checker/AdCheckerContext";

type Props = {
  hasAdCheckerSummaryFBServerError?: boolean;
  onRefresh: () => void;
  refreshStates: RefreshStates;
};

export function ProfileHeader({
  hasAdCheckerSummaryFBServerError,
  onRefresh,
  refreshStates,
}: Props) {
  const { isSuperAdmin } = useAdCheckerContext();
  return (
    <div className="flex items-center justify-between relative">
      <div>Profile</div>
      {hasAdCheckerSummaryFBServerError && isSuperAdmin && (
        <Badge
          onClick={onRefresh}
          className={cn(
            refreshStates.canRefresh
              ? "cursor-pointer text-xs"
              : "pointer-events-none opacity-50"
          )}
        >
          <RefreshCcw
            className={cn(refreshStates.isRefreshing && "animate-spin")}
          />
          Refresh
        </Badge>
      )}
    </div>
  );
}

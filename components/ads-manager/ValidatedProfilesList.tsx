import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GlobalTooltip } from "../shared/tooltip/GlobalTooltip";

type ValidatedProfile = {
  profile: string;
  canRequest: boolean;
  status: string[];
};

type Props = {
  validatedProfiles: ValidatedProfile[];
  isActionDisabled?: boolean;
  handleRemoveProfile: (params: { profileName: string }) => void;
};

export function ValidatedProfilesList({
  validatedProfiles,
  isActionDisabled = false,
  handleRemoveProfile,
}: Props) {
  if (validatedProfiles.length < 1) return null;

  return (
    <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto p-2 w-full">
      {validatedProfiles.map((data, idx) => {
        const badge = (
          <Badge
            key={idx}
            className="flex relative"
            variant={!data.canRequest ? "destructive" : "secondary"}
          >
            <div>{data.profile}</div>
            <span
              className={cn(
                isActionDisabled ? "pointer-events-none" : "cursor-pointer"
              )}
              onClick={() => handleRemoveProfile({ profileName: data.profile })}
            >
              <X className="h-4 w-4" />
            </span>
          </Badge>
        );

        if (!data.canRequest) {
          return (
            <GlobalTooltip key={idx} tooltipText={data.status[0]}>
              {badge}
            </GlobalTooltip>
          );
        }

        return badge;
      })}
    </div>
  );
}

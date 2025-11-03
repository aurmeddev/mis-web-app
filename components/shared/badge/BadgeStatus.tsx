import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import React from "react";

function BadgeStatus({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={"outline"}>
      <div className="flex items-center gap-1 px-1 py-1 w-full">
        <span className="relative flex h-2 w-2">
          <span
            className={cn(
              "relative inline-flex rounded-full h-2 w-2",
              isActive ? "bg-emerald-500" : "bg-rose-500"
            )}
          ></span>
        </span>
        <div>{isActive ? "Active" : "Inactive"}</div>
      </div>
    </Badge>
  );
}

export const MemoizedBadgeStatus = React.memo(BadgeStatus);

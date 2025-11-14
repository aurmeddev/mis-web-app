import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, UserPen, UserRoundCog } from "lucide-react";
import { EditOptionsProps } from "../../UserAccess.types";
import React from "react";

function EditOptions({ onEditOptionSelection }: EditOptionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          Edit Options <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-full">
        <DropdownMenuLabel>Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => onEditOptionSelection("info")}>
          <UserPen /> Edit Info
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => onEditOptionSelection("permission")}>
          <UserRoundCog /> Edit Permission
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const EditOptionsMemo = React.memo(EditOptions);

import { Copy } from "lucide-react";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type Props = {
  handleCopy: () => void;
};

export function GeneratorButtonCopy({ handleCopy }: Props) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className="absolute bg-transparent cursor-pointer hover:bg-primary-foreground focus:bg-primary-foreground shadow-none top-1/2 -translate-y-1/2 text-xs right-1"
          size={"sm"}
          variant={"ghost"}
          onClick={handleCopy}
        >
          <Copy />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Copy to clipboard</p>
      </TooltipContent>
    </Tooltip>
  );
}

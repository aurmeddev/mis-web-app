import { Copy } from "lucide-react";
import { Button } from "../ui/button";

type Props = {
  handleCopy: () => void;
};

export function GeneratorButtonCopy({ handleCopy }: Props) {
  return (
    <Button
      className="absolute bg-transparent cursor-pointer hover:bg-primary-foreground focus:bg-primary-foreground shadow-none top-1/2 -translate-y-1/2 text-xs right-1"
      size={"sm"}
      variant={"ghost"}
      onClick={handleCopy}
    >
      <Copy />
    </Button>
  );
}

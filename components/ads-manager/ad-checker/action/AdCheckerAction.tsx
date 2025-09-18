import { Button } from "@/components/ui/button";

type Props = {
  onViewCreatives: (adCreatives: any) => void;
};

export function AdCheckerAction({ onViewCreatives }: Props) {
  return (
    <Button
      className="cursor-pointer text-xs"
      variant={"link"}
      onClick={onViewCreatives}
    >
      View Ad Creatives
    </Button>
  );
}

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { X } from "lucide-react";
import { Dispatch, ReactNode, SetStateAction } from "react";
import { Button } from "../ui/button";

type SearchResultContainerProps = {
  children: ReactNode;
  setShowResults: Dispatch<SetStateAction<boolean>>;
};

export const SearchResultContainer = ({
  children,
  setShowResults,
}: SearchResultContainerProps) => {
  return (
    <Card className="absolute gap-0 py-3 rounded-md top-[calc(100%+0.5rem)] w-full max-w-md mx-auto z-40">
      <CardHeader className="px-4 pb-0 pt-0">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-semibold">Result</h2>
          <Button
            className="cursor-pointer text-gray-500 hover:text-gray-700 p-0"
            onClick={() => setShowResults(false)}
            aria-label="Close"
            size={"sm"}
            type="button"
            variant={"ghost"}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-2">
        <ul>{children}</ul>
      </CardContent>
    </Card>
  );
};

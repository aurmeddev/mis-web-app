import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { X } from "lucide-react";
import { Dispatch, ReactNode, SetStateAction } from "react";

type SearchResultProps = {
  children: ReactNode;
  setShowResults: Dispatch<SetStateAction<boolean>>;
};

export const SearchResult = ({
  children,
  setShowResults,
}: SearchResultProps) => {
  return (
    <Card className="absolute gap-0 py-3 rounded-md top-[calc(100%+0.5rem)] w-full max-w-md mx-auto z-40">
      <CardHeader className="px-4 pb-0 pt-0">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-semibold">Result</h2>
          <button
            className="cursor-pointer text-gray-500 hover:text-gray-700"
            onClick={() => setShowResults(false)}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="px-2">
        <ul>{children}</ul>
      </CardContent>
    </Card>
  );
};

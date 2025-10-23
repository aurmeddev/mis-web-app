import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Props = {
  currentPage: number;
  limit: number;
  total_pages: number;
  handlePagination: (page: number, limit: number) => void;
  className?: string;
};

export function Pagination({
  currentPage,
  limit,
  total_pages,
  handlePagination,
  className,
}: Props) {
  const limits = ["10", "20", "30", "40", "50"];
  return (
    <div className={cn(className, "flex justify-end gap-2 mr-2")}>
      <Select
        disabled={!currentPage}
        value={String(limit)}
        onValueChange={(value) => handlePagination(currentPage, Number(value))}
      >
        <SelectTrigger size="sm" className="font-medium text-xs w-[12%]">
          <SelectValue placeholder="Select a limit" />
        </SelectTrigger>
        <SelectContent className="text-xs">
          <SelectGroup>
            {limits.map((limit) => (
              <SelectItem key={limit} value={limit}>
                Limit: {limit}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button
        className="cursor-pointer h-8 px-4 dark:text-white text-xs"
        disabled={currentPage <= 1 || !currentPage}
        onClick={() => handlePagination(currentPage - 1, limit)}
        variant={"outline"}
      >
        Previous
      </Button>
      <Button
        className="cursor-pointer h-8 px-4 dark:text-white text-xs"
        disabled={currentPage >= total_pages || !currentPage}
        onClick={() => handlePagination(currentPage + 1, limit)}
        variant={"outline"}
      >
        Next
      </Button>
    </div>
  );
}

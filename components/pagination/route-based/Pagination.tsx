import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  currentPage: number;
  limit: number;
  total_pages: number;
  handlePagination: (page: number, limit: number) => void;
};

export function Pagination({
  currentPage,
  limit,
  total_pages,
  handlePagination,
}: Props) {
  const limits = ["10", "20", "30", "40", "50"];
  return (
    <div className="flex justify-end gap-2 mt-2 mr-2">
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
                {limit}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button
        className="cursor-pointer h-8 px-4 text-white text-xs"
        disabled={currentPage <= 1 || !currentPage}
        onClick={() => handlePagination(currentPage - 1, limit)}
        variant={"outline"}
      >
        Previous
      </Button>
      <Button
        className="cursor-pointer h-8 px-4 text-white text-xs"
        disabled={currentPage >= total_pages || !currentPage}
        onClick={() => handlePagination(currentPage + 1, limit)}
        variant={"outline"}
      >
        Next
      </Button>
    </div>
  );
}

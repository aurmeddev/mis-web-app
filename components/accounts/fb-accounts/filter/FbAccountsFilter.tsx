import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ListFilter } from "lucide-react";
import { FbAccountsFilterProps } from "../type";
import { MultiSelectComboBox as SelectRecruiter } from "@/components/select/MultiSelectComboBox";
import { useEffect, useState } from "react";
import { StatusSelectFilter } from "./select/StatusSelectFilter";
import { Button } from "@/components/ui/button";
import { PopoverClose } from "@radix-ui/react-popover";

export function FbAccountsFilter({
  recruiters,
  onApplyFilter,
  searchParams,
  isSuperOrAdmin,
}: FbAccountsFilterProps) {
  const [selectedRecruiter, setSelectedRecruiter] = useState<string[]>(
    searchParams.recruiter
  );
  const [selectedStatus, setSelectedStatus] = useState<string>(
    searchParams.status || "show-all"
  );
  const [isActionDisabled, setIsActionDisabled] = useState(true);

  const handleStatusFilter = (value: string) => {
    setSelectedStatus(value);
  };

  const handleApplyFilter = () => {
    setIsActionDisabled(true);
    onApplyFilter({ selectedRecruiter, selectedStatus });
  };

  useEffect(() => {
    const recruiterChanged =
      JSON.stringify(selectedRecruiter) !==
      JSON.stringify(searchParams.recruiter);

    const statusChanged = selectedStatus !== (searchParams.status || "");

    setIsActionDisabled(!(recruiterChanged || statusChanged));
  }, [selectedStatus, selectedRecruiter, searchParams]);

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant={"outline"}>
            <ListFilter /> Filters
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="space-y-3">
          {isSuperOrAdmin ? (
            <>
              <SelectRecruiter
                selectOptions={recruiters}
                selectedOptions={selectedRecruiter}
                setSelectedOptions={setSelectedRecruiter}
                label="recruiter"
              />

              <StatusSelectFilter
                onChange={(value) => handleStatusFilter(value)}
                value={selectedStatus}
                isDisabled={false}
              />
            </>
          ) : (
            <div className="flex flex-col gap-1">
              <div className="text-sm">Select Status:</div>
              <StatusSelectFilter
                onChange={(value) => handleStatusFilter(value)}
                value={selectedStatus}
                isDisabled={false}
              />
            </div>
          )}
          <PopoverClose className="flex" asChild>
            <Button
              className="cursor-pointer ml-auto"
              onClick={handleApplyFilter}
              disabled={isActionDisabled}
            >
              Apply
            </Button>
          </PopoverClose>
        </PopoverContent>
      </Popover>
    </>
  );
}

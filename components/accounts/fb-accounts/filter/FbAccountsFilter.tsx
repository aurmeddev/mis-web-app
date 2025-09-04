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

export function FbAccountsFilter({
  recruiters,
  onApplyFilter,
  searchParams,
}: FbAccountsFilterProps) {
  const [selectedRecruiter, setSelectedRecruiter] = useState<string[]>(
    searchParams.recruiter
  );
  const [selectedStatus, setSelectedStatus] = useState<string>(
    searchParams.status || ""
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
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={"outline"}>
          <ListFilter /> Filters
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="space-y-3">
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

        <Button
          className="cursor-pointer flex ml-auto"
          onClick={handleApplyFilter}
          disabled={isActionDisabled}
        >
          Apply
        </Button>
      </PopoverContent>
    </Popover>
  );
}

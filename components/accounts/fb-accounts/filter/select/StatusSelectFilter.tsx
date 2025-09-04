import { StatusSelectProps } from "@/components/accounts/select/StatusSelect";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function StatusSelectFilter({
  onChange,
  value,
  isDisabled,
}: StatusSelectProps) {
  return (
    <Select onValueChange={onChange} value={value} disabled={isDisabled}>
      <SelectTrigger className="h-8 w-full">
        <SelectValue placeholder="Select a status" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Status</SelectLabel>
          <SelectItem value="active">
            <div className="flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <div className="text-sm">Active</div>
            </div>
          </SelectItem>
          <SelectItem value="available">
            <div className="flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-500"></span>
              </span>
              <div className="text-sm">Available</div>
            </div>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

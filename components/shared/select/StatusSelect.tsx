import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type StatusSelectProps = {
  className?: string;
  isDisabled: boolean;
  onChange: (value: string) => void;
  value: string;
};

export function StatusSelect({
  className,
  isDisabled,
  onChange,
  value,
}: StatusSelectProps) {
  return (
    <Select onValueChange={onChange} value={value} disabled={isDisabled}>
      <SelectTrigger className={cn("h-8", className)}>
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
              <div>Active</div>
            </div>
          </SelectItem>
          <SelectItem value="inactive">
            <div className="flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <div>Inactive</div>
            </div>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

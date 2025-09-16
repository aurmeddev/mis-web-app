import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select";

type StatusSelectProps = {
  isDisabled: boolean;
  onChange: (value: string) => void;
  value: string;
};

export function StatusSelect({
  isDisabled,
  onChange,
  value,
}: StatusSelectProps) {
  return (
    <Select onValueChange={onChange} value={value} disabled={isDisabled}>
      <SelectTrigger className="h-8">
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

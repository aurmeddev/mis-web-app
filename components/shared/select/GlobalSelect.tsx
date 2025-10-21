import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { SelectOptions } from "./type";

type Props = {
  className?: string;
  isDisabled?: boolean;
  options: SelectOptions[];
  onSelectedValue: (value: string) => void;
  placeholder: string;
  value: string;
};
export function GlobalSelect({
  className,
  isDisabled,
  options,
  onSelectedValue,
  placeholder,
  value,
}: Props) {
  return (
    <Select
      value={String(value)}
      onValueChange={(value) => onSelectedValue(value)}
      disabled={isDisabled}
    >
      <SelectTrigger className={cn(className, "w-full")}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.id} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

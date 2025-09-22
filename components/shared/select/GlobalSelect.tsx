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
  options: SelectOptions[];
  onValueChange: (value: string) => void;
  placeholder: string;
};
export function GlobalSelect({
  className,
  onValueChange,
  options,
  placeholder,
}: Props) {
  return (
    <Select onValueChange={onValueChange}>
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

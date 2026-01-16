import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format, isValid, parse } from "date-fns";
import { useState, useEffect } from "react";
import { IDateInput } from "../LogsPostback.types";

export default function EditableDateInput({ value, onDateChange }: IDateInput) {
  const [localValue, setLocalValue] = useState(
    value ? format(value, "yyyy-MM-dd") : ""
  );

  useEffect(() => {
    if (value) setLocalValue(format(value, "yyyy-MM-dd"));
  }, [value]);

  const isInvalid =
    localValue.length === 10 &&
    !isValid(parse(localValue, "yyyy-MM-dd", new Date()));

  return (
    <Input
      className={cn(
        "w-32 h-9 transition-colors",
        isInvalid ? "border-red-500 focus-visible:ring-red-500" : "bg-white"
      )}
      value={localValue}
      onChange={(e) => {
        setLocalValue(e.target.value);
        onDateChange(e.target.value);
      }}
      placeholder="yyyy-mm-dd"
    />
  );
}

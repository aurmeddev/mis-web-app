"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

type Props = {
  label: string;
  options: any;
  onSelectValue: (value: any) => void;
  handleLoadingStateClassName?: string;
  selectedValue: any;
};

export function MultiSelectComboBoxV2({
  label,
  options,
  onSelectValue,
  handleLoadingStateClassName,
  selectedValue,
}: Props) {
  const [open, setOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<any>(
    selectedValue || []
  );

  const handleSelect = (currentValue: string) => {
    setSelectedOptions((prev: string[]) =>
      prev.includes(currentValue)
        ? prev.filter((prop: string) => prop !== currentValue)
        : [...prev, currentValue]
    );
  };
  const handleRemove = (valueToRemove: string) => {
    setSelectedOptions((prev: any) =>
      prev.filter((val: any) => val !== valueToRemove)
    );
  };

  useEffect(() => {
    onSelectValue(selectedOptions);
  }, [selectedOptions]);

  return (
    <Command className="rounded-lg border">
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 px-3 py-2 border-b cursor-text max-h-24 overflow-auto">
          {selectedOptions.map((value: any) => {
            const option = options.find((prop: any) => prop.value === value);
            return (
              <Badge
                key={value}
                variant="secondary"
                className={cn(
                  "flex items-center gap-1 cursor-pointer",
                  handleLoadingStateClassName
                )}
              >
                {option?.label || value}
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemove(value);
                  }}
                  className="flex items-center"
                >
                  <X size={14} className="cursor-pointer" />
                </div>
              </Badge>
            );
          })}
        </div>
      )}
      <CommandInput
        disabled={options.length === 0}
        placeholder={label}
        className="h-9 remove-search-icon"
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      />
      {open && (
        <CommandList className="max-h-40 overflow-y-auto">
          <CommandEmpty>{`No ${label} found.`}</CommandEmpty>
          <CommandGroup>
            {options.map((option: any) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent blur
                  handleSelect(option.value);
                }}
              >
                {option.label}
                <Check
                  className={cn(
                    "ml-auto",
                    selectedOptions.includes(option.value)
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      )}
    </Command>
  );
}

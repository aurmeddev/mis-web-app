"use client";

import { useState } from "react";
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

type MultiSelectComboBoxProps = {
  selectOptions: any;
  selectedOptions: any;
  setSelectedOptions: React.Dispatch<React.SetStateAction<any>>;
  label: string;
  handleLoadingStateClassName?: string;
};

export function MultiSelectComboBox({
  selectOptions,
  selectedOptions,
  setSelectedOptions,
  label,
  handleLoadingStateClassName,
}: MultiSelectComboBoxProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (currentValue: string) => {
    setSelectedOptions((prev: any) =>
      prev.includes(currentValue)
        ? prev.filter((prop: any) => prop !== currentValue)
        : [...prev, currentValue]
    );
  };
  const handleRemove = (valueToRemove: string) => {
    setSelectedOptions((prev: any) =>
      prev.filter((val: any) => val !== valueToRemove)
    );
  };
  return (
    <Command className="rounded-lg border">
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 px-3 py-2 border-b cursor-text max-h-24 overflow-auto">
          {selectedOptions.map((value: any) => {
            const option = selectOptions.find(
              (prop: any) => prop.value === value
            );
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
        disabled={selectOptions.length === 0}
        placeholder={`Select ${label}`}
        className="h-9 remove-search-icon"
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      />
      {open && (
        <CommandList className="max-h-40 overflow-y-auto">
          <CommandEmpty>{`No ${label} found.`}</CommandEmpty>
          <CommandGroup>
            {selectOptions.map((option: any) => (
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

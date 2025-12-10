"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

// Define the shape of the component's props
type DatePickerProps = {
  selectedDate: Date | undefined;
  onSetDate: (date: Date | undefined) => void;
  isSubmitInProgress?: boolean;
};

export function DatePicker({
  selectedDate,
  onSetDate,
  isSubmitInProgress = false,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    onSetDate(date);
    setOpen(false);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        asChild
        className={isSubmitInProgress ? "animate-pulse" : ""}
      >
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground"
          )}
          disabled={isSubmitInProgress}
        >
          {/* Calendar Icon */}
          <CalendarIcon className="mr-2 h-4 w-4" />

          {/* Display selected date or placeholder */}
          {selectedDate ? (
            format(selectedDate, "LLL dd, y")
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="p-2 w-auto">
        <div className="rounded-md border">
          <Calendar
            mode="single"
            defaultMonth={selectedDate}
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => date >= today || isSubmitInProgress}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Rename the original export to the cleaner name
export { DatePicker as DatePickerOnlyPopover };

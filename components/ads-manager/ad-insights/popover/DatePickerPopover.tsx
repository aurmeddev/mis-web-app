"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useEffect } from "react";
import { DatePickerWithRange } from "@/components/shared/datepicker/DatePickerWithRange";
import { DateRange } from "react-day-picker";
import { DatePresetSelect } from "@/components/shared/datepicker/DatePresetSelect";

type TrendsCalendarPresetsContainerProps = {
  dateRange: DateRange | undefined;
  onSetDateRange: (range: DateRange) => void;
  isSubmitInProgress: boolean;
};
export function DatePickerPopover({
  dateRange,
  onSetDateRange,
  isSubmitInProgress,
}: TrendsCalendarPresetsContainerProps) {
  const [open, setOpen] = useState(false);
  const [localDateRange, setLocalDateRange] = useState<DateRange | undefined>(
    dateRange
  );

  //   useEffect(() => {
  //     return () => {
  //       onSetDateRange(localDateRange as DateRange);
  //       setLocalDateRange(dateRange);
  //     };
  //   }, [open]);

  useEffect(() => {
    onSetDateRange(localDateRange as DateRange);
  }, [localDateRange]);

  const arraysEqualAsSets = (params: {
    dataSetA: string | string[];
    dataSetB: string | string[];
  }): boolean => {
    const { dataSetA, dataSetB } = params;
    const dsetA = typeof dataSetA === "number" ? [dataSetA] : dataSetA;
    const dsetB = typeof dataSetB === "number" ? [dataSetB] : dataSetB;
    const setA = new Set(dsetA);
    const setB = new Set(dsetB);
    if (setA.size !== setB.size) return false;
    return Array.from(setA).every((val) => setB.has(val));
  };

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
            !dateRange && "text-muted-foreground"
          )}
        >
          <CalendarIcon />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "LLL dd, y")} -{" "}
                {format(dateRange.to, "LLL dd, y")}
              </>
            ) : (
              format(dateRange.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="p-2 max-w-[650px] w-full max-h-[80vh] overflow-y-auto"
      >
        <div className="flex flex-col space-y-2">
          <DatePresetSelect
            dateRange={localDateRange}
            setDateRange={setLocalDateRange}
            triggerClassName={
              isSubmitInProgress ? "pointer-events-none animate-pulse" : ""
            }
          />
          <div className="rounded-md border">
            <DatePickerWithRange
              hasDatePresets={true}
              dateRange={localDateRange}
              setDateRange={setLocalDateRange}
              isStateLoading={isSubmitInProgress}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

import {
  addDays,
  isEqual,
  startOfDay,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  endOfMonth,
} from "date-fns";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { DateRangeStateProps } from "./datepicker.type";
import { withOptionalDefaultWidth } from "@/lib/utils/select/SelectHelpers";
import { DatetimeUtils } from "@/lib/utils/date/DatetimeUtils";

const dateUtils = new DatetimeUtils();
const currentDateInTimezone = dateUtils.getDatesInTimezone(); // Replace new Date() object for date and timezone accuracy.
export const datePresets: Record<string, { from: Date; to: Date }> = {
  yesterday: {
    from: addDays(currentDateInTimezone, -1),
    to: addDays(currentDateInTimezone, -1),
  },
  "2-days-ago": {
    from: addDays(currentDateInTimezone, -2),
    to: addDays(currentDateInTimezone, -1),
  },
  "this-month": {
    from: startOfMonth(currentDateInTimezone),
    to: subDays(currentDateInTimezone, 1),
  },
  "last-month": {
    from: startOfMonth(subMonths(currentDateInTimezone, 1)),
    to: endOfMonth(subMonths(currentDateInTimezone, 1)),
  },
  "last-3-months": {
    from: startOfMonth(subMonths(currentDateInTimezone, 3)),
    to: subDays(currentDateInTimezone, 1),
  },
  "last-6-months": {
    from: startOfMonth(subMonths(currentDateInTimezone, 6)),
    to: subDays(currentDateInTimezone, 1),
  },
  "this-year": {
    from: startOfYear(currentDateInTimezone),
    to: subDays(currentDateInTimezone, 1),
  },
};

export const defaultDateRangeValue = datePresets["last-3-months"];

const datePresetLabels: Record<string, string> = {
  yesterday: "Yesterday",
  "2-days-ago": "2 days ago",
  "this-month": "This month",
  "last-month": "Last month",
  "last-3-months": "Last 3 months",
  "last-6-months": "Last 6 months",
  "this-year": "This year",
  custom: "Custom range", // fallback label
};

type DatePresetSelectProps = DateRangeStateProps & {
  triggerClassName?: string;
};

export function DatePresetSelect({
  dateRange,
  setDateRange,
  triggerClassName,
}: DatePresetSelectProps) {
  const [selectedPreset, setSelectedPreset] = useState(() =>
    dateRange ? findPresetKey(dateRange) : "custom"
  );

  useEffect(() => {
    const matched = dateRange ? findPresetKey(dateRange) : "custom";
    setSelectedPreset(matched);
  }, [dateRange]);

  const handlePresetChange = (value: string) => {
    const preset = datePresets[value];
    if (preset) {
      setDateRange(preset);
    }
  };

  return (
    <Select defaultValue={selectedPreset} onValueChange={handlePresetChange}>
      <SelectTrigger className={withOptionalDefaultWidth(triggerClassName)}>
        <SelectValue placeholder="Select date preset">
          {selectedPreset && (
            <Badge variant="secondary" className="gap-2">
              <span>Date preset:</span>
              {datePresetLabels[selectedPreset]}
            </Badge>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent position="popper">
        {Object.entries(datePresetLabels).map(
          ([key, label]) =>
            key !== "custom" && (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            )
        )}
      </SelectContent>
    </Select>
  );
}

// Match current range to a preset
function findPresetKey(range: DateRange): string {
  if (!range?.from || !range?.to) return "custom";

  const normalizedFrom = startOfDay(range.from);
  const normalizedTo = startOfDay(range.to);

  return (
    Object.entries(datePresets).find(([, preset]) => {
      return (
        isEqual(startOfDay(preset.from), normalizedFrom) &&
        isEqual(startOfDay(preset.to), normalizedTo)
      );
    })?.[0] || "custom"
  );
}

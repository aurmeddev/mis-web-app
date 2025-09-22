import { DateRange } from "react-day-picker";

type DateRangeStateProps = {
  dateRange: DateRange | undefined;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
};

type DatePickerWithRangeProps = DateRangeStateProps & {
  className?: string;
  haveDatePresets?: boolean;
  isStateLoading?: boolean;
};

export type { DatePickerWithRangeProps, DateRangeStateProps };

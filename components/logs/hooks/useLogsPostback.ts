import { useState } from "react";
import { DateRange } from "react-day-picker";
import {
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  endOfYear,
  startOfYear,
  parse,
  isValid,
  format,
  isAfter,
  subHours,
} from "date-fns";
import { ClientPostbackLogs } from "@/lib/features/postback/logs/export/ClientPostbackLogs";
import { showToast } from "@/lib/utils/toast";
import {
  ILogPostbackExportState,
  IPreset,
} from "../postback/LogsPostback.types";
import { Json2CsvManager } from "@/lib/utils/converter/Json2CsvManager";

export const useLogsPostback = (initialRange: DateRange) => {
  const ecPostbackLogsService = new ClientPostbackLogs();
  const jsonCsvManager = new Json2CsvManager();

  const [date, setDate] = useState<DateRange | undefined>(initialRange);
  const [startTime, setStartTime] = useState(
    format(subHours(new Date(), 24), "HH:mm"),
  );
  const [endTime, setEndTime] = useState(format(new Date(), "HH:mm"));
  const [exportState, setExportState] = useState<ILogPostbackExportState>({
    isExportReady: false,
    data: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>("Last 24 hours");

  const presets = [
    {
      label: "Today",
      getValue: () => ({ from: new Date(), to: new Date() }),
      startTime: "00:00",
      endTime: format(new Date(), "HH:mm"),
    },
    {
      label: "Yesterday",
      getValue: () => ({
        from: subDays(new Date(), 1),
        to: subDays(new Date(), 1),
      }),
      startTime: "00:00",
      endTime: "23:59",
    },
    {
      label: "Last 24 hours",
      getValue: () => ({ from: subDays(new Date(), 1), to: new Date() }),
      startTime: "00:00",
      endTime: "23:59",
    },
    {
      label: "Last 48 hours",
      getValue: () => ({ from: subDays(new Date(), 2), to: new Date() }),
      startTime: format(subDays(new Date(), 2), "HH:mm"),
      endTime: format(new Date(), "HH:mm"),
    },
    {
      label: "Last 3 days",
      getValue: () => ({ from: subDays(new Date(), 3), to: new Date() }),
      startTime: "00:00",
      endTime: format(new Date(), "HH:mm"),
    },
    {
      label: "Last 7 days",
      getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }),
      startTime: "00:00",
      endTime: format(new Date(), "HH:mm"),
    },
    {
      label: "This month",
      getValue: () => ({
        from: startOfMonth(new Date()),
        to: new Date(),
      }),
      startTime: "00:00",
      endTime: "23:59",
    },
    {
      label: "Last 30 days",
      getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }),
      startTime: "00:00",
      endTime: format(new Date(), "HH:mm"),
    },
    {
      label: "Last month",
      getValue: () => {
        const lastMonth = subMonths(new Date(), 1);
        return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
      },
      startTime: "00:00",
      endTime: "23:59",
    },
    {
      label: "This year",
      getValue: () => ({
        from: startOfYear(new Date()),
        to: new Date(),
      }),
      startTime: "00:00",
      endTime: "23:59",
    },
    {
      label: "Custom",
      getValue: () => date,
      startTime: startTime,
      endTime: endTime,
    },
  ];

  const getCombinedDates = (formatStr: string) => {
    if (!date?.from || !date?.to) return null;

    const date_from = parse(
      `${format(date.from, "yyyy-MM-dd")} ${startTime}`,
      "yyyy-MM-dd HH:mm",
      new Date(),
    );
    const date_to = parse(
      `${format(date.to, "yyyy-MM-dd")} ${endTime}`,
      "yyyy-MM-dd HH:mm",
      new Date(),
    );

    return {
      date_from: format(date_from, formatStr),
      date_to: format(date_to, formatStr),
      raw_from: date_from,
      raw_to: date_to,
    };
  };

  const handleManualDateChange = (type: "from" | "to", value: string) => {
    const parsedDate = parse(value, "yyyy-MM-dd", new Date());
    if (isValid(parsedDate)) {
      setExportState((prev) => ({ ...prev, isExportReady: false }));
      setDate((prev) => {
        if (!prev)
          return type === "from"
            ? { from: parsedDate, to: undefined }
            : { from: undefined, to: parsedDate };
        return { ...prev, [type]: parsedDate };
      });
    }
  };

  const handlePresetClick = (preset: IPreset) => {
    const { label, getValue, startTime, endTime } = preset;
    setExportState((prev) => ({ ...prev, isExportReady: false }));
    setDate(getValue());
    setSelectedPreset(label);
    setStartTime(startTime);
    setEndTime(endTime);
  };

  const handleSubmit = async () => {
    const combined = getCombinedDates("yyyy-MM-dd HH:mm:ss");

    // VALIDATION: Ensure dates exist and range is logical
    if (!combined) {
      showToast(false, "Please select both a start and end date.");
      return;
    }

    if (isAfter(combined.raw_from, combined.raw_to)) {
      showToast(false, "Start time cannot be after end time.");
      return;
    }

    const combinedDateTime = {
      date_from: combined.date_from,
      date_to: combined.date_to,
    };

    setIsSubmitting(true);
    try {
      const { isSuccess, data, message } =
        await ecPostbackLogsService.export(combinedDateTime);
      if (!isSuccess) {
        showToast(false, message);
        return;
      }
      setExportState({ isExportReady: true, data });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadPostbackLog = async () => {
    const sanitizeObject = <T extends Record<string, any>>(obj: T): T =>
      Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, v == null ? "" : v]),
      ) as T;

    const sanitizedData = exportState.data.map(sanitizeObject);
    const combined = getCombinedDates("yyyy-MM-dd h:mmaaa");

    if (!combined) return;

    try {
      const csv = await jsonCsvManager.convertJsonToCSV(sanitizedData);
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Postback Log Issue - ${combined.date_from} to ${combined.date_to}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error converting JSON to CSV:", err);
    }
  };

  return {
    date,
    setDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    presets,
    handlePresetClick,
    handleSubmit,
    handleManualDateChange,
    handleDownloadPostbackLog,
    isSubmitting,
    exportState,
    selectedPreset,
  };
};

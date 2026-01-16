"use client";

import TimeInput from "./custom-date-time-range/TimeInput";
import PresetSidebar from "./custom-date-time-range/PresetSidebar";
import EditableDateInput from "./custom-date-time-range/EditableDateInput";
import LogPostbackDownload from "./LogsPostbackDownload";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useLogsPostback } from "../hooks/useLogsPostback";
import { format, isDate, subDays } from "date-fns";
import { Loader2 } from "lucide-react";

export default function LogsPostbackManager() {
  const {
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
  } = useLogsPostback({
    from: subDays(new Date(), 1),
    to: subDays(new Date(), 1),
  });

  const dateFrom = isDate(date?.from)
    ? format(String(date?.from), "MMM d")
    : "";
  const dateTo = isDate(date?.to) ? format(String(date?.to), "MMM d") : "";

  return (
    <>
      <div className="w-full border rounded-lg bg-white overflow-hidden text-sm">
        <div className="p-4 flex flex-col gap-4 border-b">
          <div className="flex items-center gap-2">
            <EditableDateInput
              value={date?.from}
              onDateChange={(val) => handleManualDateChange("from", val)}
            />
            <TimeInput value={startTime} onChange={setStartTime} />
            <span className="text-muted-foreground px-1">-</span>
            <EditableDateInput
              value={date?.to}
              onDateChange={(val) => handleManualDateChange("to", val)}
            />
            <TimeInput value={endTime} onChange={setEndTime} />

            <div className="flex justify-end ml-auto gap-2 bg-white">
              {/* <Button variant="ghost" size="sm" className="px-6 h-9">
          Cancel
        </Button> */}
              <Button
                disabled={isSubmitting}
                onClick={handleSubmit}
                size="sm"
                className="cursor-pointer w-24 h-9 rounded-md"
              >
                {isSubmitting && <Loader2 className="animate-spin" />} Submit
              </Button>
            </div>
          </div>
        </div>

        <div className="flex">
          <div className="p-2 border-r">
            <Calendar
              mode="range"
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
              classNames={{
                day_range_middle: "bg-blue-50 text-accent-foreground",
                day_selected:
                  "bg-blue-600 text-white hover:bg-blue-600 focus:bg-blue-600",
              }}
              disabled={{ after: new Date() }}
            />
          </div>

          <PresetSidebar
            presets={presets}
            onSelect={handlePresetClick}
            selectedLabel={selectedPreset}
          />
        </div>
      </div>

      {exportState.isExportReady && (
        // <div className="mt-8 text-center">
        //   <div className="text-muted-foreground text-sm">
        //     Export file is ready
        //   </div>
        //   <Button
        //     className="cursor-pointer"
        //     variant={"link"}
        //     onClick={handleDownloadPostbackLog}
        //   >
        //     Download
        //   </Button>
        // </div>

        <LogPostbackDownload
          dates={{ from: dateFrom, to: dateTo }}
          onDownloadPostbackLog={handleDownloadPostbackLog}
        />
      )}
    </>
  );
}

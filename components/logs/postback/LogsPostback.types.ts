import { DateRange } from "react-day-picker";

interface IPreset {
  label: string;
  getValue: () => DateRange | undefined;
  startTime: string;
  endTime: string;
}

interface IPresetSidebar {
  presets: IPreset[];
  onSelect: (preset: IPreset) => void;
  selectedLabel?: string;
}

interface ILogPostbackExportState {
  isExportReady: boolean;
  data: any;
}

interface ILogPostbackDownload {
  dates: {
    from: string;
    to: string;
  };
  onDownloadPostbackLog: () => void;
}

interface ITimeInput {
  value: string;
  onChange: (val: string) => void;
}

interface IDateInput {
  value: Date | undefined;
  onDateChange: (value: string) => void;
}

export type {
  IPreset,
  IPresetSidebar,
  ILogPostbackExportState,
  ILogPostbackDownload,
  ITimeInput,
  IDateInput,
};

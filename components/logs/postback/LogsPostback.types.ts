import { DateRange } from "react-day-picker";

interface IPreset {
  label: string;
  getValue: () => DateRange | undefined;
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

export type {
  IPreset,
  IPresetSidebar,
  ILogPostbackExportState,
  ILogPostbackDownload,
};

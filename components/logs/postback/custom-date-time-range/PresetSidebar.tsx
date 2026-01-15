"use client";

import { cn } from "@/lib/utils";
import { IPresetSidebar } from "../LogsPostback.types";

export default function PresetSidebar({
  presets,
  onSelect,
  selectedLabel,
}: IPresetSidebar) {
  return (
    <div className="w-44 flex flex-col py-2 border-l bg-white">
      {presets.map((preset) => {
        const isActive = selectedLabel === preset.label;

        return (
          <button
            key={preset.label}
            type="button"
            onClick={() => onSelect(preset)}
            className={cn(
              "px-4 py-2 text-left text-[13px] transition-colors",
              isActive
                ? "text-blue-600 bg-blue-50 font-medium"
                : "text-slate-600 hover:bg-slate-50"
            )}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ITimeInput {
  value: string;
  onChange: (val: string) => void;
}

export default function TimeInput({ value, onChange }: ITimeInput) {
  const timeOptions = Array.from({ length: 25 }, (_, i) => {
    const hour = i.toString().padStart(2, "0");
    return `${hour}:00`;
  });

  return (
    <div className="relative flex items-center group">
      <Input
        className="w-20 h-9 pr-7 focus-visible:ring-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="HH:mm"
      />
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="absolute right-2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-28 p-0" align="end" sideOffset={5}>
          <ScrollArea className="h-60">
            <div className="flex flex-col">
              {timeOptions.map((time) => (
                <button
                  key={time}
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 first:rounded-t-md last:rounded-b-md"
                  onClick={() => onChange(time)}
                >
                  {time}
                </button>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}

"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import DarkTheme from "@/public/images/dark_preview.svg";
import LightTheme from "@/public/images/light_preview.svg";
export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const themeOption = [
    {
      theme: "light",
      image: LightTheme,
    },
    {
      theme: "dark",
      image: DarkTheme,
    },
  ];

  return (
    <div className="flex flex-col gap-6 text-sm">
      <div className="">
        {`Choose how VCC web app looks to you. Select a single theme and automatically switch between day and night themes. Selections are applied immediately and saved automatically.`}
      </div>
      {themeOption.map((item: any, index: number) => (
        <div
          key={index}
          onClick={() => setTheme(item.theme)}
          className="w-[350px] relative border rounded-sm flex flex-col cursor-pointer"
        >
          <Image
            src={item.image}
            alt="theme preview"
            style={{
              width: "100%",
              height: "auto",
            }}
            className="rounded-t-sm"
            priority
          />
          <div className="border-t p-2 flex flex-row gap-x-1">
            <span
              className={`capitalize ${
                item.theme !== theme && "text-muted-foreground"
              }`}
            >{`${item.theme} mode`}</span>
            {item.theme === theme && <Check className="h-4 w-4" />}
          </div>
        </div>
      ))}
    </div>
  );
}

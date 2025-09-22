import { cn } from "@/lib/utils";

export function withOptionalDefaultWidth(triggerClassName?: string): string {
  const defaultClass = "rounded-lg sm:ml-auto";
  if (typeof triggerClassName === "undefined" || !triggerClassName) {
    return cn("w-full", defaultClass);
  }

  const widthClassRegex =
    /\b(?:sm:|md:|lg:|xl:|2xl:)?(?:w-\[?\d|w-full|max-w-|min-w-)/;
  const hasWidthClass = widthClassRegex.test(triggerClassName?.trim() ?? "");

  return cn(
    !hasWidthClass && "w-full", // apply default if no width class found
    "rounded-lg sm:ml-auto",
    triggerClassName
  );
}

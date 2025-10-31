import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type StepProgressProps = {
  steps: string[];
  currentStep: number; // 1-based index
  className?: string;
};

export function StepProgress({
  steps,
  currentStep,
  className,
}: StepProgressProps) {
  return (
    <div className={cn("flex items-center w-full", className)}>
      {steps.map((label, idx) => {
        const isActive = currentStep === idx + 1 || currentStep > idx + 1;
        const isCompleted = currentStep > idx + 1;

        return (
          <div
            key={label}
            className={cn(
              "flex items-center text-xs",
              idx != steps.length - 1 && "flex-1",
              idx > 0 && "ml-2"
            )}
          >
            {/* Step Circle */}
            <div
              className={cn(
                "flex items-center justify-center h-6 mr-2 rounded-full text-white w-6",
                isActive ? "bg-primary" : "bg-gray-500"
              )}
            >
              {isCompleted ? <Check className="w-4" /> : idx + 1}
            </div>

            {/* Label */}
            <div className="pr-2 whitespace-nowrap">{label}</div>

            {/* Connecting line */}
            {idx != steps.length - 1 && (
              <div className="border flex-1 w-full"></div>
            )}
          </div>
        );
      })}
    </div>
  );
}

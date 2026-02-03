import { AlertDisplay } from "@/components/auth/alert-display";
import { cn } from "@/lib/utils";

interface IAlertSectionProps {
  className?: string;
  title: string;
  message: string;
}
export const GlobalAlertSection = ({
  className,
  title,
  message,
}: IAlertSectionProps) => {
  return (
    <>
      {message && (
        <div className={cn("grid gap-2", className)}>
          <AlertDisplay title={title} description={message} />
        </div>
      )}
    </>
  );
};

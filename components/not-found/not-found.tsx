import { Terminal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
interface Props {
  msg: string;
  title: string;
}
interface paramProps {
  param: Props;
}
export function NotFound({ param }: paramProps) {
  const { title, msg } = param;
  return (
    <div className="p-4">
      <Alert variant="loggedout">
        <Terminal className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{msg}</AlertDescription>
      </Alert>
    </div>
  );
}

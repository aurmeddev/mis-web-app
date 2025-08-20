import {
  RocketIcon,
  ExclamationTriangleIcon,
  ExitIcon,
} from "@radix-ui/react-icons";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function AlertDisplay({ title, description }: any) {
  return (
    <Alert
      variant={`${
        title === "Operational"
          ? "default2"
          : title === "Logged out"
          ? "loggedout"
          : title === "Inactive"
          ? "inactive"
          : "destructive2"
      }`}
      className=""
    >
      {title === "Operational" ? (
        <RocketIcon className="h-4 w-4" />
      ) : title === "Logged out" ? (
        <ExitIcon className="h-4 w-4" />
      ) : (
        <ExclamationTriangleIcon className="h-4 w-4" />
      )}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";

type RHFInputProps = {
  control: Control<any>; // Use your specific form type instead of 'any' if possible
  name: string;
  label: string;
  placeholder: string;
  type?: "text" | "email" | "password";
  isOptional?: boolean;
};

export const RHFInput = ({
  control,
  name,
  label,
  placeholder,
  type = "text",
  isOptional = false,
}: RHFInputProps) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>
          {label}
          {isOptional && (
            <span className="text-muted-foreground"> (optional)</span>
          )}
        </FormLabel>
        <FormControl>
          <Input
            placeholder={placeholder}
            type={type}
            autoComplete={name === "email" ? "off" : undefined}
            {...field}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Control } from "react-hook-form";
import { GlobalSelect } from "../select/GlobalSelect";
import { SelectOptions } from "../select/type";
type RHFSelectProps = {
  control: Control<any>;
  name: string;
  label: string;
  placeholder: string;
  options: SelectOptions[];
};

export const RHFSelect = ({
  control,
  name,
  label,
  placeholder,
  options,
}: RHFSelectProps) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <GlobalSelect
            options={options}
            onSelectedValue={field.onChange}
            placeholder={placeholder}
            value={field.value}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

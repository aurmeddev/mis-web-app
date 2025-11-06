import { RHFInput } from "@/components/shared/rhf/RHFInput";
import { RHFPasswordToggleInput } from "@/components/shared/rhf/RHFPasswordToggleInput";
import { RHFSelect } from "@/components/shared/rhf/RHFSingleSelect";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Step1FieldsProps } from "../../UserAccess.types";

export const Step1Fields = ({
  control,
  userSelectOptions,
}: Step1FieldsProps) => {
  return (
    <>
      <RHFInput
        control={control}
        name="full_name"
        label="Full Name"
        placeholder="input"
      />
      <RHFInput
        control={control}
        name="display_name"
        label="Display Name"
        placeholder="input"
        isOptional
      />

      <RHFInput
        control={control}
        name="email"
        label="Email"
        placeholder="your.email@example.com"
        type="email"
      />

      <RHFPasswordToggleInput
        control={control}
        name="password"
        label="Password"
        placeholder="input"
      />

      <FormField
        control={control}
        name="gender"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Gender</FormLabel>
            <FormControl>
              <RadioGroup
                className="flex space-y-1"
                defaultValue={field.value}
                onValueChange={field.onChange}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem id="male" value="1" />
                  <Label htmlFor="male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem id="female" value="2" />
                  <Label htmlFor="female">Female</Label>
                </div>
              </RadioGroup>
            </FormControl>
          </FormItem>
        )}
      />

      <RHFSelect
        control={control}
        name="user_type"
        label="Account Type"
        placeholder="Select account type"
        options={userSelectOptions.user_types}
      />

      <RHFSelect
        control={control}
        name="team"
        label="Team"
        placeholder="Select team"
        options={userSelectOptions.teams}
      />
    </>
  );
};

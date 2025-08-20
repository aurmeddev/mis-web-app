import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChangeEvent } from "react";
import { HandleSubmitStateProps } from "./login-form";

export const InputPassword = ({
  submit,
  handleSubmit,
}: HandleSubmitStateProps) => {
  // Handle Input field Change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleSubmit({ ...submit, password: e.target.value.trim() });
  };
  return (
    <div className="grid gap-2">
      <div className="flex items-center">
        <Label htmlFor="password">Password</Label>
      </div>
      <Input
        value={`${submit.password}`}
        onChange={handleInputChange}
        name="password"
        type="password"
        required
      />
    </div>
  );
};

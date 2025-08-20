import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HandleSubmitStateProps } from "./login-form";
import { ChangeEvent } from "react";
export const InputEmail = ({
  submit,
  handleSubmit,
}: HandleSubmitStateProps) => {
  // Handle Input field Change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleSubmit({ ...submit, email: e.target.value.trim() });
  };
  return (
    <div className="grid gap-2">
      <Label htmlFor="email">Email</Label>
      <Input
        value={`${submit.email}`}
        onChange={handleInputChange}
        name="email"
        type="email"
        placeholder="m@example.com"
        required
      />
    </div>
  );
};

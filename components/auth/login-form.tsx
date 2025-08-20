"use client";
import { SubmitButton } from "./submit-button";
import { InputEmail } from "./input-email";
import { InputPassword } from "./input-password";
import { AlertSection } from "./alert-section";
import { InputFields } from "./input-fields";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
export type SubmitLoginParams = {
  email: string;
  password: string;
  isLoading: boolean;
  result: any;
};
export type HandleSubmitStateProps = {
  submit: SubmitLoginParams;
  handleSubmit: React.Dispatch<React.SetStateAction<SubmitLoginParams>>;
};
export function LoginForm() {
  const [submit, handleSubmit] = useState<SubmitLoginParams>({
    email: "",
    password: "",
    isLoading: false,
    result: {},
  });

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Welcome back</CardTitle>
        <CardDescription>Login to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <InputFields>
            <AlertSection submit={submit} />
            <InputEmail submit={submit} handleSubmit={handleSubmit} />
            <InputPassword submit={submit} handleSubmit={handleSubmit} />
            <SubmitButton submit={submit} handleSubmit={handleSubmit} />
          </InputFields>
        </div>
      </CardContent>
    </Card>
  );
}

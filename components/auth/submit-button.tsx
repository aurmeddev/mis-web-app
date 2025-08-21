"use client";
import { Button } from "../ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";
import { UserAuthManager } from "@/lib/features/security/user-auth/UserAuthManager";
import { UserAuthClientService } from "@/lib/features/security/user-auth/UserAuthClientService";
import { HandleSubmitStateProps } from "./login-form";
import { appBaseUrl } from "@/lib/base-url/appBaseUrl";
export const SubmitButton = ({
  submit,
  handleSubmit,
}: HandleSubmitStateProps) => {
  const auth = new UserAuthManager(new UserAuthClientService());
  const processSubmit = async () => {
    const { ip_address } = await getUserIpAddressResult();
    handleSubmit({ ...submit, isLoading: true });

    const processLogin = await auth.login({
      ip_address: ip_address,
      email: submit.email,
      password: submit.password,
    });

    handleSubmit({ ...submit, isLoading: false, result: processLogin });
    if (processLogin.isSuccess) {
      window.location.href = `${appBaseUrl}/login`;
    }
  };
  const getUserIpAddressResult = async () => {
    const result = await auth.getUserIpAddress();
    return {
      ip_address: result.data.ip_address,
    };
  };

  return (
    <Button
      onClick={() => processSubmit()}
      className="w-full"
      disabled={submit.isLoading || !submit.email || !submit.password}
    >
      {submit.isLoading ? (
        <ReloadIcon className="gap-x-1 h-4 w-4 animate-spin" />
      ) : (
        ""
      )}
      Login
    </Button>
  );
};

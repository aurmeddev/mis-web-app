import { AlertDisplay } from "./alert-display";
import { SubmitLoginParams } from "./login-form";
type AlertSectionProps = {
  submit: SubmitLoginParams;
};
export const AlertSection = ({ submit }: AlertSectionProps) => {
  return (
    <div className="grid gap-2">
      {submit.result?.message && !submit.result?.isSuccess ? (
        <AlertDisplay
          title={"Login failed"}
          description={submit.result?.message}
        />
      ) : (
        ""
      )}
    </div>
  );
};

import { IFacebookForm } from "../Facebook.types";
import { FormHeader } from "./FormHeader";
import { PixelInput } from "./PixelInput";
import { TokenTextarea } from "./TokenTextarea";
import { FormActions } from "./FormActions";

export function FacebookForm({
  formState,
  onFormReset,
  onSubmit,
  onPixelFormChange,
  onProceed,
  pixelFormData,
}: IFacebookForm) {
  const isOnConfirmationMode =
    formState.isExisted &&
    !formState.canProceed &&
    pixelFormData.pixel.length > 0;
  const isUpdateMode = formState.isExisted && formState.canProceed;
  return (
    <div className="mx-auto max-w-[530px] p-8">
      <FormHeader isUpdateMode={isUpdateMode} />
      <form className="space-y-8" onSubmit={onSubmit}>
        <div className="space-y-4">
          <PixelInput
            formState={formState}
            isOnConfirmationMode={isOnConfirmationMode}
            onPixelFormChange={onPixelFormChange}
            onProceed={onProceed}
            pixelFormData={pixelFormData}
          />
          <TokenTextarea
            isOnConfirmationMode={isOnConfirmationMode}
            onPixelFormChange={onPixelFormChange}
            token={pixelFormData.token}
          />
        </div>
        <FormActions
          onFormReset={onFormReset}
          isSubmitting={formState.isSubmitting}
          isOnConfirmationMode={isOnConfirmationMode}
          isUpdateMode={isUpdateMode}
        />
      </form>
    </div>
  );
}

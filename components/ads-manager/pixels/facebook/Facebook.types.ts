import { FormEvent } from "react";

interface IFacebookPixelFormData {
  id?: number;
  pixel: string;
  token: string;
}

interface IFacebookFormState {
  canProceed: boolean;
  isExisted: boolean;
  isSubmitting: boolean;
}

interface IFacebookForm {
  formState: IFacebookFormState;
  pixelFormData: IFacebookPixelFormData;
  onFormReset: () => void;
  onSubmit: (ev: FormEvent<HTMLFormElement>) => void;
  onPixelFormChange: (name: string, value: string) => void;
  onProceed: () => void;
}

// FormHeader
interface IFormHeader {
  isUpdateMode: boolean;
}

interface IPixelInput extends Omit<IFacebookForm, "onSubmit" | "onFormReset"> {
  isOnConfirmationMode: boolean;
}

interface ITokenTextarea
  extends Pick<IPixelInput, "isOnConfirmationMode" | "onPixelFormChange"> {
  token: string;
}

interface IFormActions {
  isOnConfirmationMode: boolean;
  onFormReset: () => void;
  isSubmitting: boolean;
  isUpdateMode: boolean;
}

export type {
  IFacebookPixelFormData,
  IFacebookForm,
  IFormHeader,
  IPixelInput,
  ITokenTextarea,
  IFormActions,
};

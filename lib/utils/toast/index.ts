import { ExternalToast, toast } from "sonner";

export const showToast = (
  isSuccess: boolean,
  message: string,
  option?: ExternalToast
) => {
  if (!isSuccess) {
    toast.error(message, option);
  } else {
    toast.success(message, option);
  }
};

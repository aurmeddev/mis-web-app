"use client";
import { FormEvent, useRef, useState } from "react";
import { IFacebookPixelFormData } from "./Facebook.types";
import { FacebookForm } from "./form/FacebookForm";
import { showToast } from "@/lib/utils/toast";
import { Info } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { ObjectUtils } from "@/lib/utils/object/ObjectUtils";
import { PixelClient } from "@/lib/features/pixel/PixelClient";

const INITIAL_FORM_VALUE = {
  pixel: "",
  token: "",
};
export function FacebookContainer() {
  const pixelService = new PixelClient();
  const objectUtils = new ObjectUtils();
  const [pixelFormData, setPixelFormData] =
    useState<IFacebookPixelFormData>(INITIAL_FORM_VALUE);
  const [formState, setFormState] = useState({
    canProceed: false,
    isExisted: false,
    isSubmitting: false,
  });
  const oldPixelFormData = useRef<IFacebookPixelFormData>(INITIAL_FORM_VALUE);

  const handleSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    setFormState((prevState) => ({ ...prevState, isSubmitting: true }));
    if (!pixelFormData.pixel || !pixelFormData.token) {
      showToast(false, "One or more required fields are empty.", {
        icon: <Info className="h-4 text-red-500" />,
      });
      return;
    }

    const { pixel, token } = objectUtils.getChangedProperties(
      oldPixelFormData.current,
      pixelFormData
    );

    const isUpdateMode = formState.isExisted && formState.canProceed;
    const { isSuccess, message } = isUpdateMode
      ? await pixelService.update({
          id: Number(pixelFormData.id),
          pixel,
          token,
        })
      : await pixelService.post(pixelFormData);
    setFormState((prevState) => ({ ...prevState, isSubmitting: false }));
    if (!isSuccess) {
      showToast(false, message);
      return;
    }
    handleFormReset();
    showToast(true, message);
  };

  const handlePixelFormChange = (name: string, value: string) => {
    setPixelFormData((prevState) => ({ ...prevState, [name]: value }));

    if (name === "pixel" && !formState.canProceed) {
      handleSearchDebounce(value);
    }
  };

  const handleSearchDebounce = useDebouncedCallback(
    async (searchText: string) => {
      if (/^\s+$/.test(searchText) || !searchText) {
        return;
      }
      const { data } = await pixelService.find({
        method: "find-one",
        searchKeyword: searchText.trim(),
      });

      if (data.length > 0) {
        const { id, pixel, token } = data[0];
        setPixelFormData({ id, pixel, token });
        setFormState((prevState) => ({ ...prevState, isExisted: true }));
      } else {
        setFormState((prevState) => ({ ...prevState, isExisted: false }));
      }
    },
    500
  );

  const handleProceed = () => {
    setFormState((prevState) => ({ ...prevState, canProceed: true }));
    oldPixelFormData.current = pixelFormData;
  };

  const handleFormReset = () => {
    setPixelFormData(INITIAL_FORM_VALUE);
    setFormState((prevState) => ({
      ...prevState,
      canProceed: false,
      isExisted: false,
    }));
  };

  const handleDateTimeChange = (range: { from: Date; to: Date }) => {
    console.log("range ", range);
  };

  return (
    <FacebookForm
      formState={formState}
      onFormReset={handleFormReset}
      onSubmit={handleSubmit}
      onPixelFormChange={handlePixelFormChange}
      onProceed={handleProceed}
      pixelFormData={pixelFormData}
    />
  );
}

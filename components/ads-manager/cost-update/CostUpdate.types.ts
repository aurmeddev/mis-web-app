import { Dispatch, FormEvent, SetStateAction } from "react";
import { DateRange } from "react-day-picker";
import { DropzoneInputProps, DropzoneRootProps } from "react-dropzone";

interface ICostUpdateForm {
  costUpdateFileState: ICostUpdateFileState;
  costUpdateResult: ICostUpdateExport[];
  date: Date | undefined;
  dropZoneProps: <T extends DropzoneRootProps>(props?: T) => T;
  inputFileProps: <T extends DropzoneInputProps>(props?: T) => T;
  isSubmitting: boolean;
  isDragActive: boolean;
  onBulkUpdateCost: (ev: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
  onDownloadResult: () => void;
  onSetDateRange: (range: Date | undefined) => void;
}

interface ICostUpdateCSV {
  login_code: string;
  spend: number;
}

interface ICostUpdateExport extends ICostUpdateCSV {
  status: string;
  isSuccess: boolean;
}

interface ICostUpdateFileState {
  data: ICostUpdateCSV[];
  fileName: string;
}

interface ICostUpdateActions extends Pick<ICostUpdateForm, "onClear"> {
  hasNotUploaded: boolean;
  isSubmitting: boolean;
}

interface IFileUploadDropzone
  extends Pick<
    ICostUpdateForm,
    "dropZoneProps" | "inputFileProps" | "isDragActive"
  > {
  fileName: string;
}

export type {
  ICostUpdateForm,
  ICostUpdateCSV,
  ICostUpdateExport,
  ICostUpdateFileState,
  ICostUpdateActions,
  IFileUploadDropzone,
};

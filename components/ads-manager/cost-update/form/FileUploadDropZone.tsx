import { Upload } from "lucide-react";
import { IFileUploadDropzone } from "../CostUpdate.types";
import { Input } from "@/components/ui/input";

export function FileUploadDropzone({
  dropZoneProps,
  inputFileProps,
  isDragActive,
  fileName,
}: IFileUploadDropzone) {
  const isDraggingStyle = isDragActive
    ? "border-blue-500 bg-accent"
    : "border-dashed border-input";

  return (
    <label
      {...dropZoneProps()}
      className={`${isDraggingStyle} hover:bg-accent flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 p-8 transition-colors`}
    >
      <Upload className="text-muted-foreground mb-3 h-10 w-10" />
      <p className="mb-1 text-sm font-medium">
        Click to upload or drag and drop
      </p>
      <p className="text-muted-foreground text-xs">
        {fileName ? (
          <span className="text-blue-500 underline">{fileName}</span>
        ) : (
          "CSV file format"
        )}
      </p>

      <Input {...inputFileProps()} className="hidden" />
    </label>
  );
}

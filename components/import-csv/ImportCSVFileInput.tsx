"use client";
import { Import, Upload } from "lucide-react";
import { Dispatch, SetStateAction, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Json2CsvManager } from "@/lib/utils/converter/Json2CsvManager";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  title?: string;
  onSetFileData: (json: any) => void;
  setFilename?: Dispatch<SetStateAction<string>>;
  onReset?: () => void;
  onFileValidate: (isValid: boolean) => void;
  isDisabled?: boolean;
  btnVariant?:
    | "outline"
    | "link"
    | "default"
    | "destructive"
    | "secondary"
    | "ghost"
    | null
    | undefined;
};

export const ImportCSVFileInput = ({
  className,
  title,
  onSetFileData,
  setFilename,
  onReset,
  onFileValidate,
  isDisabled,
  btnVariant = "outline",
}: Props) => {
  const inputFileRef = useRef<HTMLInputElement | null>(null);

  const csv = new Json2CsvManager();
  const handleFileChange = async (event: any) => {
    const file = event.target.files[0];
    if (file.type !== "text/csv") {
      onFileValidate(false);
      return;
    }
    if (onReset) {
      onReset();
    }
    if (file) {
      if (setFilename) {
        setFilename(file.name); // Set the filename including extension
      }
      const reader = new FileReader();
      reader.onload = async (e: any) => {
        const text = e.target.result;
        const filter = text.replace(/\r/g, ""); // Remove carriage return (\r) characters
        const json = await csv.convertCsvToJSON(filter);
        onSetFileData(json);

        // Reset input value so the same file can be selected again
        if (inputFileRef.current) {
          inputFileRef.current.value = "";
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <>
      <Button
        variant={btnVariant}
        className={cn("cursor-pointer h-8", className)}
        onClick={() => inputFileRef.current?.click()}
        disabled={isDisabled}
      >
        <Upload />
        {title ? title : "Import file"}
      </Button>
      <Input
        className="hidden"
        ref={inputFileRef}
        type="file"
        id="csvFileInput"
        accept=".csv"
        onChange={(e: any) => handleFileChange(e)}
      />
    </>
  );
};

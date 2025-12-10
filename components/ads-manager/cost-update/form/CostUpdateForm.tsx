import { Label } from "@/components/ui/label";
import { ICostUpdateForm } from "../CostUpdate.types";
import { DownloadLocalFile } from "@/components/shared/download/DownloadLocalFile";
import { CostUpdateActions } from "./CostUpdateActions";
import { FileUploadDropzone } from "./FileUploadDropZone";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/shared/datepicker/DatePicker";

export function CostUpdateForm({
  costUpdateFileState,
  costUpdateResult,
  date,
  dropZoneProps,
  inputFileProps,
  isDragActive,
  isSubmitting,
  onBulkUpdateCost,
  onClear,
  onDownloadResult,
  onSetDateRange,
}: ICostUpdateForm) {
  const { fileName, data } = costUpdateFileState;
  const hasNotUploaded = data.length === 0;

  return (
    <section className="py-16">
      <div className="container mx-auto">
        <div className="mx-auto max-w-2xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold lg:text-4xl">
              Bulk Cost Update
            </h2>
            <p className="text-muted-foreground text-lg">
              Upload your completed CSV file to instantly process the bulk cost
              updates.
            </p>
          </div>

          <form onSubmit={onBulkUpdateCost} className="space-y-6">
            <div className="space-y-2">
              <Label className="flex justify-between">
                File
                <div>
                  <DownloadLocalFile
                    fileNameWithExt="cost-update-template.csv"
                    text="Download template"
                    url={"/downloadable/cost-update-template.csv"}
                  />
                </div>
              </Label>
              <div className="space-y-3">
                <FileUploadDropzone
                  dropZoneProps={dropZoneProps}
                  fileName={fileName}
                  inputFileProps={inputFileProps}
                  isDragActive={isDragActive}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Date</Label>
              <DatePicker
                selectedDate={date}
                onSetDate={onSetDateRange}
                isSubmitInProgress={isSubmitting}
              />
            </div>

            <CostUpdateActions
              hasNotUploaded={hasNotUploaded}
              onClear={onClear}
              isSubmitting={isSubmitting}
            />
          </form>

          <p className="text-muted-foreground mt-6 text-center text-sm">
            Processing time will vary based on the number of records in the
            uploaded file. You will receive a notification upon completion.
          </p>

          {costUpdateResult.length > 0 && (
            <div className="text-center">
              <Button
                className="cursor-pointer"
                variant={"link"}
                onClick={onDownloadResult}
              >
                Download Result
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

"use client";
import { FormEvent, startTransition, useCallback, useState } from "react";
import { CostUpdateForm } from "./form/CostUpdateForm";
import { Json2CsvManager } from "@/lib/utils/converter/Json2CsvManager";
import { showToast } from "@/lib/utils/toast";
import { FileRejection, useDropzone } from "react-dropzone";
import {
  ICostUpdateCSV,
  ICostUpdateExport,
  ICostUpdateFileState,
} from "./CostUpdate.types";
import { format, subDays } from "date-fns";
import { DialogProgress } from "@/components/shared/dialog-progress/DialogProgress";
import { CostUpdateManager } from "@/lib/features/ads-manager/cost-update/CostUpdateManager";
import { VoluumCostUpdateClientApi } from "@/lib/features/ads-manager/cost-update/voluum/VoluumCostUpdateClientApi";

const INITIAL_FILE_STATE = {
  data: [],
  fileName: "",
};

const INITIAL_PROGRESS = {
  actionType: "",
  count: 0,
  label: "",
  length: 0,
  itemsLabel: "",
};

export function CostUpdateContainer() {
  const costUpdateApi = new CostUpdateManager(new VoluumCostUpdateClientApi());
  const jsonCsvManager = new Json2CsvManager();
  const yesterday = subDays(new Date(), 1);

  const [date, setDate] = useState<Date | undefined>(yesterday);
  const [costUpdateFileState, setCostUpdateFileState] =
    useState<ICostUpdateFileState>(INITIAL_FILE_STATE);
  const [costUpdateProgress, setCostUpdateProgress] =
    useState(INITIAL_PROGRESS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogProgressOpen, setIsDialogProgressOpen] = useState(false);
  const [costUpdateResult, setCostUpdateResult] = useState<ICostUpdateExport[]>(
    []
  );

  const handleSetDateRange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
  };

  const onDrop = useCallback(
    <T extends File>(acceptedFiles: T[], fileRejections: FileRejection[]) => {
      // setIsDragging(false);
      if (fileRejections.length > 0) {
        showToast(false, "Invalid file type. Only CSV files are allowed.");
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        const csv = new Json2CsvManager();
        if (file) {
          const reader = new FileReader();
          reader.onload = async (e: any) => {
            const text = e.target.result;
            const filter = text.replace(/\r/g, "");
            const json = await csv.convertCsvToJSON(filter);
            setCostUpdateFileState({ fileName: file.name, data: json });
          };
          reader.readAsText(file);
        }
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/csv": [".csv"],
    },
    noClick: true,
    onDrop,
  });

  const processBulkUpdateCost = async (costUpdateArr: ICostUpdateCSV[]) => {
    if (!date) {
      showToast(false, "Please select date.");
      return;
    }

    setIsDialogProgressOpen(true);
    if (costUpdateArr.length == 0) return;
    const formattedDate = format(date || "", "yyyy-MM-dd");
    const costUpdateDataLength = costUpdateArr.length;
    const divisor = (100 / costUpdateDataLength).toFixed();

    const costUpdateResult: ICostUpdateExport[] = [];
    for (let i = 0; i < costUpdateDataLength; i++) {
      const { login_code, spend } = costUpdateArr[i];
      if (spend > 0) {
        setCostUpdateProgress((prevState) => ({
          ...prevState,
          actionType: "Updating Cost",
          label: login_code,
          length: costUpdateDataLength,
          itemsLabel: "campaigns.",
        }));
        setIsSubmitting(true);
        const { isSuccess, message } = await costUpdateApi.process({
          date_from: formattedDate,
          date_to: formattedDate,
          spend,
          campaign_id: login_code,
        });

        costUpdateResult.push({
          ...costUpdateArr[i],
          isSuccess,
          status: message,
        });
        setCostUpdateResult(costUpdateResult);
        setCostUpdateProgress((prevState) => {
          const currentProgress = prevState.count + Number(divisor);
          return {
            ...prevState,
            count: currentProgress >= 99 ? 100 : currentProgress,
            label: login_code,
          };
        });
      }
    }
    setIsDialogProgressOpen(false);
    setIsSubmitting(false);
    startTransition(() => setCostUpdateProgress(INITIAL_PROGRESS));
    handleClear();
    showToast(true, "Cost update complete!");
  };

  const handleBulkUpdateCost = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    processBulkUpdateCost(costUpdateFileState.data);
  };

  const handleClear = () => {
    setCostUpdateFileState(INITIAL_FILE_STATE);
    setDate(yesterday);
  };

  const handleDownloadResult = async () => {
    if (costUpdateResult.length == 0) {
      showToast(false, "Cost Update result is empty.");
      return;
    }
    try {
      const sortedResult = costUpdateResult.sort((s, r) => {
        if (s.isSuccess === false && r.isSuccess === true) return -1;
        if (s.isSuccess === true && r.isSuccess === false) return 1;
        return 0;
      });
      const filteredResult = sortedResult.map(({ isSuccess, ...rest }) => rest);
      const csv = await jsonCsvManager.convertJsonToCSV(filteredResult);

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);

      const todayDateTime = format(new Date(), "MM-dd-yyyy h-mm a");
      const a = document.createElement("a");
      a.href = url;
      a.download = `cost-update-result-${todayDateTime}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error converting JSON to CSV:", err);
    }
  };

  const dialogProgressTexts = {
    actionType: costUpdateProgress.actionType,
    currentItemTitle: costUpdateProgress.label,
    itemsLabel: costUpdateProgress.itemsLabel,
  };

  return (
    <>
      <DialogProgress
        open={isDialogProgressOpen}
        itemsLength={costUpdateFileState.data.length}
        progress={costUpdateProgress.count}
        texts={dialogProgressTexts}
      />
      <CostUpdateForm
        costUpdateFileState={costUpdateFileState}
        costUpdateResult={costUpdateResult}
        date={date}
        dropZoneProps={getRootProps}
        inputFileProps={getInputProps}
        isDragActive={isDragActive}
        isSubmitting={isSubmitting}
        onBulkUpdateCost={handleBulkUpdateCost}
        onClear={handleClear}
        onDownloadResult={handleDownloadResult}
        onSetDateRange={handleSetDateRange}
      />
    </>
  );
}

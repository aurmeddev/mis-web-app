import { Button } from "@/components/ui/button";
import { Download, CheckCircle } from "lucide-react"; // Optional: for icons
import { ILogPostbackDownload } from "./LogsPostback.types";

export default function LogsPostbackDownload({
  dates,
  onDownloadPostbackLog,
}: ILogPostbackDownload) {
  return (
    <div className="w-full max-w-4xl mx-auto mt-4 animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Log Export Complete
            </h3>
            <p className="text-sm text-gray-600">
              Your postback log ({dates.from} - {dates.to}) is ready for
              download
            </p>
          </div>
        </div>

        <Button
          onClick={onDownloadPostbackLog}
          className="cursor-pointer flex items-centerfont-medium rounded-md transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Download
        </Button>
      </div>
    </div>
  );
}

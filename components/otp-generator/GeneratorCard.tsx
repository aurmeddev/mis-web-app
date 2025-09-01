import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClipboardUtils } from "@/lib/utils/clipboard/ClipboardUtils";
import { Clipboard } from "lucide-react";
import { toast } from "sonner";
import { GeneratorCountdown } from "./GeneratorCountdown";
import { GeneratorCardProps } from "./type";
import { GeneratorButtonCopy } from "./GeneratorButtonCopy";
import { logAction } from "@/lib/features/logger/LogAction";
import { cn } from "@/lib/utils";

export function GeneratorCard({
  selectedResult,
  otp,
  generateOTP,
}: GeneratorCardProps) {
  const clipboardUtils = new ClipboardUtils();
  const getCopyData = (
    identifier: "otp" | "username" | "password",
    otp: string,
    selectedResult: Record<string, any>
  ) => {
    switch (identifier) {
      case "otp":
        return { text: otp, logType: 5 };
      case "username":
        return { text: selectedResult.fb_account.username, logType: 7 };
      case "password":
        return { text: selectedResult.fb_account.password, logType: 8 };
      default:
        throw new Error("Invalid identifier");
    }
  };

  const handleCopy = async (identifier: "otp" | "username" | "password") => {
    const { text, logType } = getCopyData(identifier, otp, selectedResult);

    await clipboardUtils.copyToClipboard(text);
    toast.success("Copied to clipboard!", { icon: <Clipboard /> });

    await logAction({
      log_type_id: logType,
      description: selectedResult.profile_name,
    });
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="relative">
        <CardTitle className="relative">
          <div className="font-semibold">{selectedResult.profile_name}</div>
          <div className="font-normal mt-5 text-muted-foreground">
            Your one-time code is:
          </div>
        </CardTitle>
        <CardDescription>
          <div
            className={cn(
              !otp ? "text-sm" : "text-2xl",
              "bg-muted font-bold relative rounded py-2 text-center"
            )}
          >
            {otp || (
              <div className="text-red-500">No secret key was provided</div>
            )}
            {otp && (
              <GeneratorButtonCopy handleCopy={() => handleCopy("otp")} />
            )}
          </div>
          <div className="flex gap-1 mt-2 relative">
            This code expires in
            {otp ? (
              <GeneratorCountdown otp={otp} generateOTP={generateOTP} />
            ) : (
              " 0s"
            )}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="grid gap-1">
            <div className="text-muted-foreground">Username</div>
            <div className="relative text-muted-foreground">
              <div className="bg-muted font-bold relative rounded py-2 text-center">
                {selectedResult.fb_account.username}
              </div>
              <GeneratorButtonCopy handleCopy={() => handleCopy("username")} />
            </div>
          </div>
          <div className="grid gap-1">
            <div className="text-muted-foreground">Password</div>
            <div className="relative text-muted-foreground">
              <div className="bg-muted font-bold relative rounded py-1 text-center text-2xl">
                *********
              </div>
              <GeneratorButtonCopy handleCopy={() => handleCopy("password")} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

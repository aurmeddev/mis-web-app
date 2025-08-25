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

export function GeneratorCard({
  selectedResult,
  otp,
  generateOTP,
}: GeneratorCardProps) {
  const clipboardUtils = new ClipboardUtils();
  const handleCopy = async (identifier: "otp" | "username" | "password") => {
    let textToCopy = "";
    if (identifier == "otp") {
      textToCopy = otp;
    } else if (identifier == "username") {
      textToCopy = selectedResult.fb_account.username;
    } else {
      textToCopy = selectedResult.fb_account.password;
    }
    await clipboardUtils.copyToClipboard(textToCopy);
    toast.success("Copied to clipboard!", { icon: <Clipboard /> });
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
          <div className="bg-muted font-bold relative rounded py-2 text-center text-2xl">
            {otp}

            <GeneratorButtonCopy handleCopy={() => handleCopy("otp")} />
          </div>
          <div className="flex gap-1 mt-2 relative">
            This code expires in
            <GeneratorCountdown otp={otp} generateOTP={generateOTP} />
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

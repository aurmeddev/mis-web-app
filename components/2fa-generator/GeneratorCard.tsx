import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ClipboardUtils } from "@/lib/utils/clipboard/ClipboardUtils";
import { Clipboard, Copy } from "lucide-react";
import { toast } from "sonner";
import { GeneratorCountdown } from "./GeneratorCountdown";
import { GeneratorCardProps } from "./type";

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

  const spaced = otp.replace(/(\d{3})(\d{3})/, "$1 $2");
  return (
    <Card className="w-full max-w-xs">
      <CardHeader className="relative">
        <CardTitle className="relative">
          {selectedResult.profile_name}

          <GeneratorCountdown otp={otp} generateOTP={generateOTP} />
        </CardTitle>
        <CardDescription>
          <div className="font-bold text-5xl">{spaced}</div>
        </CardDescription>
        <Button
          className="absolute cursor-pointer hover:bg-secondary focus:bg-primary-foreground shadow-none bottom-1 text-xs right-6"
          size={"sm"}
          variant={"secondary"}
          onClick={() => handleCopy("otp")}
        >
          <Copy />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <div className="grid">
            <div className="font-semibold">Email</div>
            <div className="relative">
              <div className="text-muted-foreground">
                {selectedResult.fb_account.username}
              </div>
              <Button
                className="absolute cursor-pointer hover:bg-secondary focus:bg-primary-foreground shadow-none -top-1 text-xs right-0"
                size={"sm"}
                variant={"secondary"}
                onClick={() => handleCopy("username")}
              >
                <Copy />
              </Button>
            </div>
          </div>
          <div className="grid">
            <div className="font-semibold">Password</div>
            <div className="relative">
              <div className="font-semibold text-muted-foreground">
                *********
              </div>
              <Button
                className="absolute cursor-pointer hover:bg-secondary focus:bg-primary-foreground shadow-none -top-1 text-xs right-0"
                size={"sm"}
                variant={"secondary"}
                onClick={() => handleCopy("password")}
              >
                <Copy />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

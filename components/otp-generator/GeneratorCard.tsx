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

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="relative">
        <CardTitle className="relative">
          <div className="font-semibold text-muted-foreground">
            {selectedResult.profile_name}
          </div>
          <div className="font-normal mt-5 text-muted-foreground">
            Your one-time code is:
          </div>
        </CardTitle>
        <CardDescription>
          <div className="bg-muted font-bold relative rounded py-2 text-center text-2xl">
            {otp}

            <Button
              className="absolute bg-transparent cursor-pointer hover:bg-primary-foreground focus:bg-primary-foreground shadow-none top-1/2 -translate-y-1/2 text-xs right-1"
              size={"sm"}
              variant={"ghost"}
              onClick={() => handleCopy("otp")}
            >
              <Copy />
            </Button>
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
            <div className="">Username</div>
            <div className="relative">
              <div className="bg-muted font-bold relative rounded py-2 text-center text-muted-foreground">
                {selectedResult.fb_account.username}
              </div>
              <Button
                className="absolute cursor-pointer hover:bg-secondary focus:bg-primary-foreground shadow-none top-1/2 -translate-y-1/2 text-xs right-0"
                size={"sm"}
                variant={"secondary"}
                onClick={() => handleCopy("username")}
              >
                <Copy />
              </Button>
            </div>
          </div>
          <div className="grid gap-1">
            <div className="">Password</div>
            <div className="relative">
              <div className="bg-muted font-bold relative rounded py-1 text-center text-2xl text-muted-foreground">
                *********
              </div>
              <Button
                className="absolute cursor-pointer hover:bg-secondary focus:bg-primary-foreground shadow-none top-1/2 -translate-y-1/2 text-xs right-0"
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

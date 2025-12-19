import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ICFGHOtpCard } from "./CFGH.types";
import { cn } from "@/lib/utils";
import { GeneratorButtonCopy } from "../GeneratorButtonCopy";
import { GeneratorCountdown } from "../GeneratorCountdown";

export default function CFGHOtpCard({}: ICFGHOtpCard) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="relative">
        <CardTitle className="relative">
          <div className="font-normal mt-5 text-muted-foreground">
            Your one-time code is:
          </div>
        </CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="grid gap-1">
            <div className="text-muted-foreground">Username</div>
            <div className="relative text-muted-foreground">
              <div className="bg-muted font-bold relative rounded py-2 text-center text-2xl">
                *********
              </div>
              {/* <GeneratorButtonCopy handleCopy={() => handleCopy("username")} /> */}
            </div>
          </div>
          <div className="grid gap-1">
            <div className="text-muted-foreground">Password</div>
            <div className="relative text-muted-foreground">
              <div className="bg-muted font-bold relative rounded py-1 text-center text-2xl">
                *********
              </div>
              {/* <GeneratorButtonCopy handleCopy={() => handleCopy("password")} /> */}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

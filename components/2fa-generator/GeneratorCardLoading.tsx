import { Copy } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
import { Button } from "../ui/button";

export function GeneratorCardLoading() {
  return (
    <Card className="w-full max-w-xs">
      <CardHeader className="relative">
        <CardTitle className="relative">
          <div className="animate-pulse bg-muted rounded w-1/2">
            <div className="opacity-0">-</div>
          </div>
          <div className="animate-pulse absolute bg-muted font-bold right-0 text-muted-foreground rounded top-0 w-[10%]">
            <div className="opacity-0">-</div>
          </div>
        </CardTitle>
        <CardDescription>
          <div className="font-bold rounded text-5xl w-[60%]">--- ---</div>
        </CardDescription>
        <Button
          className="absolute hover:bg-secondary shadow-none bottom-1 pointer-events-none text-xs right-6"
          size={"sm"}
          variant={"secondary"}
        >
          <Copy className="opacity-0" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <div className="grid">
            <div className="font-semibold">Email</div>
            <div className="relative">
              <div className="animate-pulse bg-muted rounded w-[50%]">
                <div className="opacity-0">-</div>
              </div>
              <Button
                className="absolute hover:bg-secondary shadow-none -top-1 pointer-events-none text-xs right-0"
                size={"sm"}
                variant={"secondary"}
              >
                <Copy className="opacity-0" />
              </Button>
            </div>
          </div>
          <div className="grid">
            <div className="font-semibold">Password</div>
            <div className="relative">
              <div className="animate-pulse bg-muted rounded w-[50%]">
                <div className="opacity-0">-</div>
              </div>
              <Button
                className="absolute hover:bg-secondary shadow-none -top-1 pointer-events-none text-xs right-0"
                size={"sm"}
                variant={"secondary"}
              >
                <Copy className="opacity-0" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

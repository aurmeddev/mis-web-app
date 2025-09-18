import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useState,
  useTransition,
} from "react";
import { X } from "lucide-react";
import { InternetBSInfo } from "../table/DomainsTableContainer";
import { Badge } from "@/components/ui/badge";

type Props = {
  internetBsInfo: Partial<InternetBSInfo>;
  onDialogOpenState: (isOpen: boolean) => void;
  open: boolean;
};

export function DomainsDialog({
  internetBsInfo,
  onDialogOpenState,
  open,
}: Props) {
  const handleClose = () => {
    onDialogOpenState(false);
  };

  const hasNameServer =
    Object.keys((internetBsInfo?.nameserver as Record<string, string>) ?? {})
      ?.length > 0;

  return (
    <Dialog open={open} onOpenChange={onDialogOpenState}>
      <DialogContent
        onEscapeKeyDown={(ev) => ev.preventDefault()}
        onCloseAutoFocus={handleClose}
        onInteractOutside={(ev) => ev.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>{internetBsInfo.domain}</DialogTitle>
          <DialogDescription className="hidden">Description</DialogDescription>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 cursor-pointer">
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>

        <div className="bg-muted border p-4 rounded-md mb-4">
          <div className="flex justify-between text-sm">
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col">
                <div>Expiration Date:</div>
                <div className="text-[0.8rem] text-muted-foreground">
                  {internetBsInfo.expirationdate}
                </div>
              </div>
              <div className="flex flex-col">
                <div>Registration Date:</div>
                <div className="text-[0.8rem] text-muted-foreground">
                  {internetBsInfo.registrationdate}
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col">
                <div>Paid Until:</div>
                <div className="text-[0.8rem] text-muted-foreground">
                  {internetBsInfo.paiduntil}
                </div>
              </div>
              <div className="flex flex-col">
                <div>Domain Status:</div>
                <div className="text-[0.8rem] text-muted-foreground">
                  {internetBsInfo.domainstatus}
                </div>
              </div>
            </div>
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col">
                <div>Auto Renew:</div>
                <div className="text-[0.8rem] text-muted-foreground">
                  {internetBsInfo.autorenew}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-muted border flex justify-between items-center mb-4 p-4 rounded-md space-y-0.5">
          <div className="pr-2">
            <div className="text-sm">Nameserver</div>
            <div className="text-[0.8rem] text-muted-foreground">
              <ul className="list-disc pl-4">
                {hasNameServer && internetBsInfo.nameserver ? (
                  <>
                    {Object.values(internetBsInfo.nameserver).map((ns, idx) => (
                      <li key={idx}>{ns}</li>
                    ))}
                  </>
                ) : (
                  <></>
                )}
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

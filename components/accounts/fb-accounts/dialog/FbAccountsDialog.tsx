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
import { Input } from "@/components/ui/input";
import { FormEvent } from "react";
import { X } from "lucide-react";
import { FBAccount } from "../type";
import { Textarea } from "@/components/ui/textarea";

type ConfirmDialogProps = {
  form: any;
  open: boolean;
  canSave: boolean;
  setOpen: (open: boolean) => void;
  editingData: Partial<FBAccount>;
  handleSubmit: (ev: FormEvent<HTMLFormElement>) => void;
  handleInputChange: (name: string, value: string | number) => void;
  isActionDisabled: boolean;
};

export function FbAccountsDialog({
  form,
  open,
  canSave,
  setOpen,
  editingData,
  handleSubmit,
  handleInputChange,
  isActionDisabled,
}: ConfirmDialogProps) {
  const isUpdateMode = Object.keys(editingData).length >= 1;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        onEscapeKeyDown={(ev) => ev.preventDefault()}
        onInteractOutside={(ev) => ev.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>{isUpdateMode ? "Update" : "New"} Account</DialogTitle>
          <DialogDescription>
            Fill out the form below to{" "}
            {isUpdateMode ? "update the" : "create a new"} account.
          </DialogDescription>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 cursor-pointer">
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="fb_owner_name">
              FB Owner Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                autoFocus
                className="border h-8 px-2 py-0 rounded w-full"
                disabled={isActionDisabled}
                value={form.fb_owner_name || ""}
                onChange={(e) =>
                  handleInputChange("fb_owner_name", e.target.value)
                }
                required
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email_address">
              Email{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <div className="relative">
              <Input
                className="border h-8 px-2 py-0 rounded w-full"
                disabled={isActionDisabled}
                value={form.email_address || ""}
                onChange={(e) =>
                  handleInputChange("email_address", e.target.value)
                }
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact_no">
              Contact Number{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <div className="relative">
              <Input
                className="border h-8 px-2 py-0 rounded w-full"
                disabled={isActionDisabled}
                value={form.contact_no || ""}
                onChange={(e) =>
                  handleInputChange("contact_no", e.target.value)
                }
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="username">
              Username <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                className="border h-8 px-2 py-0 rounded w-full"
                disabled={isActionDisabled}
                value={form.username || ""}
                onChange={(e) => handleInputChange("username", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">
              Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                className="border h-8 px-2 py-0 rounded w-full"
                disabled={isActionDisabled}
                value={form.password || ""}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="app_2fa_key">
              2FA Secret Key <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                className="border h-8 px-2 py-0 rounded w-full"
                disabled={isActionDisabled}
                value={form.app_2fa_key || ""}
                onChange={(e) =>
                  handleInputChange("app_2fa_key", e.target.value)
                }
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="recovery_code">
              Recovery Code <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                className="border h-8 px-2 py-0 rounded w-full"
                disabled={isActionDisabled}
                value={form.recovery_code || ""}
                onChange={(e) =>
                  handleInputChange("recovery_code", e.target.value)
                }
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="remarks">
              Remarks{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Textarea
              className="border h-8 px-2 py-1 rounded w-full"
              disabled={isActionDisabled}
              value={form.remarks || ""}
              onChange={(e) => handleInputChange("remarks", e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button
              className="cursor-pointer"
              type="submit"
              disabled={isActionDisabled || !canSave}
            >
              {isActionDisabled ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

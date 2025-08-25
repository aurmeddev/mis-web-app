import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { StatusSelect } from "../select/StatusSelect";

type ConfirmDialogProps = {
  form: any;
  rowData: any;
  open: boolean;
  setOpen: (open: boolean) => void;
  editingRow: number | null;
  handleConfirm: (id: number) => void;
  handleEditChange: (id: number | null) => void;
  handleInputChange: (name: string, value: string) => void;
  handleStatusChange: (value: string) => void;
  isActionDisabled: boolean;
};

export function ManageApProfilesDialog({
  form,
  rowData,
  open,
  setOpen,
  handleConfirm,
  handleInputChange,
  handleStatusChange,
  isActionDisabled,
}: ConfirmDialogProps) {
  const hasInputChanged = () => {
    const selectedRecord = {} as any;

    if (selectedRecord) {
      const ip_address = selectedRecord["ip_address"];
      const name = selectedRecord["name"];
      const is_active = selectedRecord["is_active"];

      const hasChanged =
        ip_address !== form?.ip_address ||
        name !== form?.name ||
        is_active !== form?.is_active;
      return hasChanged;
    }
    return false;
  };

  const onSubmit = (data: any) => {
    console.log("Submitted data:", data);
    // TODO: send to API
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Profiles Form</DialogTitle>
          <DialogDescription>
            <i>Work in progress — not final.</i>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="profile">Profile</Label>
            <Input
              autoFocus
              className="border h-8 px-2 py-0 rounded w-full"
              disabled={isActionDisabled}
              value={form.profile_name}
              onChange={(e) =>
                handleInputChange("profile_name", e.target.value)
              }
            />
            {/* {form.formState.errors.profile && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.profile.message}
                </p>
              )} */}
          </div>

          <div>
            <Label htmlFor="recruiter">Recruiter</Label>
            <Input
              className="border h-8 px-2 py-0 rounded w-full"
              disabled={isActionDisabled}
              value={form.full_name}
              onChange={(e) => handleInputChange("full_name", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="fbName">FB Name</Label>
            <Input
              className="border h-8 px-2 py-0 rounded w-full"
              disabled={isActionDisabled}
              value={form.fb_owner_name}
              onChange={(e) =>
                handleInputChange("fb_owner_name", e.target.value)
              }
            />
          </div>

          <div>
            <Label htmlFor="username">Username / Email</Label>
            <Input
              className="border h-8 px-2 py-0 rounded w-full"
              disabled={isActionDisabled}
              value={form.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              className="border h-8 px-2 py-0 rounded w-full"
              disabled={isActionDisabled}
              value={form.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="twoFAKey">2FA Key</Label>
            <Input
              className="border h-8 px-2 py-0 rounded w-full"
              disabled={isActionDisabled}
              value={form.long_2fa_key}
              onChange={(e) =>
                handleInputChange("app_2fa_code", e.target.value)
              }
            />
          </div>

          <div>
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              className="border h-8 px-2 py-0 rounded w-full"
              disabled={isActionDisabled}
              value={form.remarks}
              onChange={(e) => handleInputChange("remarks", e.target.value)}
            />
          </div>

          <div>
            <StatusSelect
              value={String(form.is_active) || "2"}
              onChange={handleStatusChange}
              isDisabled={isActionDisabled}
            />
          </div>

          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

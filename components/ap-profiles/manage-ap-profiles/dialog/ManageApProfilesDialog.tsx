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
import { SearchInput } from "@/components/search/SearchInput";
import { ChangeEvent, useEffect, useState, useTransition } from "react";
import { SearchQuery } from "@/components/otp-generator/type";
import { SearchResult } from "@/components/search/SearchResult";
import { useDebouncedCallback } from "use-debounce";
import { FbAccountsService } from "@/lib/features/fb-accounts/FbAccountsService";
import { ManageApProfilesSearchResults } from "../search/ManageApProfilesSearchResults";
import { Loader2, X } from "lucide-react";
import { ApProfilesService } from "@/lib/features/ap-profiles/ApProfilesService";

type ConfirmDialogProps = {
  form: any;
  open: boolean;
  setOpen: (open: boolean) => void;
  editingRow: number | null;
  handleSubmit: (ev: any) => void;
  handleEditChange: (id: number | null) => void;
  handleInputChange: (name: string, value: string) => void;
  handleStatusChange: (value: string) => void;
  isActionDisabled: boolean;
};

export function ManageApProfilesDialog({
  form,
  open,
  setOpen,
  handleSubmit,
  handleInputChange,
  handleStatusChange,
  isActionDisabled,
}: ConfirmDialogProps) {
  const fbAccountsService = new FbAccountsService();
  const profilesService = new ApProfilesService();
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({
    query: "",
    isSearching: false,
    result: { data: [], isSuccess: false, message: "" },
    selectedResult: null,
  });
  const [showResults, setShowResults] = useState(false);
  const [isExisting, setIsExisting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSearchQueryChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery({ ...searchQuery, query: ev.target.value });
  };

  const handleSearchFocus = () => {
    if (searchQuery.result.data?.length) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleSearchDebounce = useDebouncedCallback(async (data: string) => {
    setSearchQuery({ ...searchQuery, isSearching: true });
    const response = await fbAccountsService.find({
      method: "find-any",
      searchKeyword: data,
    });
    setSearchQuery({ ...searchQuery, result: response, isSearching: false });
    setShowResults(true);
  }, 500);

  const handleProfileDebounce = useDebouncedCallback(async (data: string) => {
    if (!data) return setIsExisting(false);
    startTransition(async () => {
      const response = await profilesService.find({
        method: "find-one",
        searchKeyword: data,
      });
      setIsExisting(response.data.length >= 1);
    });
  }, 500);

  const handleSelectItem = (item: any) => {
    setSearchQuery((prevState: any) => ({
      ...prevState,
      query: "",
      selectedResult: item,
    }));
    handleInputChange("fb_account_id", item.id);
    setShowResults(false);
  };

  const handleRemoveSelected = () => {
    setSearchQuery((prevState: any) => ({
      ...prevState,
      query: "",
      result: {
        data: [],
      },
      selectedResult: null,
    }));
    setShowResults(false);
  };

  const handleClose = () => {
    handleRemoveSelected();
  };

  const handleProfileChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleInputChange("profile_name", e.target.value);
    handleProfileDebounce(e.target.value);
  };

  useEffect(() => {
    if (searchQuery.query) {
      handleSearchDebounce(searchQuery.query);
    }
  }, [searchQuery.query]);

  useEffect(() => {
    if (open) handleRemoveSelected();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        onEscapeKeyDown={(ev) => ev.preventDefault()}
        onCloseAutoFocus={handleClose}
        onInteractOutside={(ev) => ev.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>New Profile Form</DialogTitle>
          <DialogDescription>
            Fill out the form below to create a new profile.
          </DialogDescription>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 cursor-pointer">
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="profile_name">Profile Name</Label>
            <div className="relative">
              <Input
                autoFocus
                className="border h-8 px-2 py-0 rounded w-full"
                disabled={isActionDisabled}
                value={form.profile_name}
                onChange={(e) => handleProfileChange(e)}
                required
              />
              {isPending && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Loader2 className="animate-spin h-5 text-primary w-5" />
                </div>
              )}
            </div>
            {isExisting && (
              <p className="text-red-500 text-sm">
                A profile with this name already exists. Please choose another
                one.
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-semibold">
              {searchQuery.selectedResult ? "Assigned" : "Assign"} FB Account
            </div>
            <div className="relative w-full">
              <SearchInput
                className={
                  searchQuery.selectedResult || isActionDisabled
                    ? "pointer-events-none"
                    : ""
                }
                searchQuery={searchQuery}
                onSearchQueryChange={handleSearchQueryChange}
                onSearchFocus={handleSearchFocus}
              />
              {searchQuery.selectedResult && (
                <div className="absolute bg-primary-foreground top-1/2 -translate-y-1/2 flex items-center gap-2 left-2 rounded px-2 py-1">
                  <div className="w-4">
                    <svg
                      role="img"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="blue"
                    >
                      <title>Facebook</title>
                      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
                    </svg>
                  </div>
                  <div className="text-sm">
                    {searchQuery.selectedResult.fb_owner_name ||
                      "FB Account Selected"}
                  </div>
                  <Button
                    variant={"ghost"}
                    className="bg-transparent cursor-pointer h-3 rounded w-3 text-muted-foreground"
                    onClick={handleRemoveSelected}
                  >
                    <X />
                  </Button>
                </div>
              )}
              {showResults && (
                <SearchResult setShowResults={setShowResults}>
                  <ManageApProfilesSearchResults
                    result={searchQuery.result}
                    handleSelectItem={handleSelectItem}
                  />
                </SearchResult>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              className="border h-8 px-2 py-1 rounded w-full"
              disabled={isActionDisabled}
              value={form.remarks}
              onChange={(e) => handleInputChange("remarks", e.target.value)}
            />
          </div>

          {/* <div>
            <StatusSelect
              value={String(form.is_active) || "2"}
              onChange={handleStatusChange}
              isDisabled={isActionDisabled}
            />
          </div> */}

          <DialogFooter>
            <Button
              className="cursor-pointer"
              type="submit"
              disabled={isActionDisabled || isExisting}
            >
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

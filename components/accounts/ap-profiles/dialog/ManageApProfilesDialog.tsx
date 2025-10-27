"use-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { SearchQuery } from "@/components/otp-generator/type";
import { useDebouncedCallback } from "use-debounce";
import { FbAccountsService } from "@/lib/features/fb-accounts/FbAccountsService";
import { Check, Loader2, TriangleAlert, X } from "lucide-react";
import { ApProfilesService } from "@/lib/features/ap-profiles/ApProfilesService";
import { AssignFBSearchResults } from "../search/AssignFBSearchResults";
import { SearchWrapper } from "../search/SearchWrapper";
import {
  AccessTokenState,
  getTokens,
} from "../table/ManageApProfilesTableContainer";
import { cn } from "@/lib/utils";
import { StepProgress } from "../../../shared/step-progress/StepProgress";

type ManageApProfilesDialogProps = {
  accessTokenState: AccessTokenState;
  canSave: boolean;
  editingData: any;
  form: any;
  hasAccessToMarketingApiAccessToken: boolean;
  handleSubmit: (ev: FormEvent<HTMLFormElement>) => void;
  handleInputChange: (name: string, value: string | number) => void;
  handleModifyEditingData: (params: {
    marketing_api_access_token?: string;
    app_secret_key?: string;
  }) => void;
  isActionDisabled: boolean;
  open: boolean;
  onAccessTokenStateChange: (token: string) => void;
  onUpdateStep: (step: number) => void;
  setOpen: (open: boolean) => void;
  step: number;
};

export function ManageApProfilesDialog({
  accessTokenState,
  canSave,
  editingData,
  form,
  open,
  hasAccessToMarketingApiAccessToken,
  handleSubmit,
  handleInputChange,
  handleModifyEditingData,
  isActionDisabled,
  onAccessTokenStateChange,
  onUpdateStep,
  setOpen,
  step,
}: ManageApProfilesDialogProps) {
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
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSearchDebounce = useDebouncedCallback(async (data: string) => {
    if (/^\s+$/.test(data) || !data) {
      setShowResults(false);
      return;
    }
    setSearchQuery({ ...searchQuery, isSearching: true });
    const response = await fbAccountsService.find({
      method: "find-any",
      searchKeyword: data,
    });
    setSearchQuery({ ...searchQuery, result: response, isSearching: false });
    setShowResults(true);
  }, 500);

  const handleProfileDebounce = useDebouncedCallback(async (data: string) => {
    if (/^\s+$/.test(data) || !data) {
      setIsExisting(false);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    startTransition(async () => {
      const response = await profilesService.find({
        method: "find-one",
        searchKeyword: data.trim(),
      });
      setIsExisting(response.data.length >= 1);
      setIsSearching(false);
    });
  }, 500);

  const handleAccessTokenStateChange = (
    ev: ChangeEvent<HTMLTextAreaElement>
  ) => {
    handleInputChange("marketing_api_access_token", ev.target.value);
    onAccessTokenStateChange(ev.target.value);
  };

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

  const handleSelectItem = async (item: any) => {
    const tokens = await getTokens({
      app_secret_key: item.app_secret_key,
      marketing_api_access_token: item.marketing_api_access_token,
      type: "decrypt",
    });

    setSearchQuery((prevState: any) => ({
      ...prevState,
      query: "",
      selectedResult: item,
    }));
    handleInputChange("app_secret_key", tokens.app_secret_key);
    handleInputChange(
      "marketing_api_access_token",
      tokens.marketing_api_access_token
    );
    handleModifyEditingData({ ...tokens });
    handleInputChange("fb_account_id", item.id);
    setShowResults(false);
  };

  const handleRemoveSelected = async () => {
    setSearchQuery((prevState: any) => ({
      ...prevState,
      query: "",
      result: {
        data: [],
      },
      selectedResult: null,
    }));
    handleInputChange("fb_account_id", 0);
    setShowResults(false);
  };

  const handleProfileChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleInputChange("profile_name", e.target.value);
    handleProfileDebounce(e.target.value);
  };

  const handleClose = () => {
    setSearchQuery((prevState: any) => ({
      ...prevState,
      query: "",
      result: {
        data: [],
      },
      selectedResult: null,
    }));
    startTransition(() => {
      setShowResults(false);
      setIsExisting(false);
    });
    onUpdateStep(1);
  };

  useEffect(() => {
    if (searchQuery.query) {
      handleSearchDebounce(searchQuery.query);
    }
  }, [searchQuery.query]);

  useEffect(() => {
    if (open) handleClose();
  }, [open]);

  //identify if editingData has existing fb account data
  useEffect(() => {
    const fbAccount = editingData.fb_account;
    const validFbAccount =
      !fbAccount || Object.keys(fbAccount).length !== 0 ? fbAccount : null;
    setSearchQuery((prevState: any) => ({
      ...prevState,
      selectedResult: validFbAccount,
    }));
  }, [editingData.fb_account]);

  const isUpdateMode = Object.keys(editingData).length >= 1;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        onEscapeKeyDown={(ev) => ev.preventDefault()}
        onCloseAutoFocus={handleClose}
        onInteractOutside={(ev) => ev.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>
            {isUpdateMode ? "Update" : "New"} Profile Form
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            Fill out the form below to{" "}
            {isUpdateMode ? "update" : "create a new"} profile.
          </div>

          <div className="flex justify-between pt-2 relative w-full">
            <StepProgress
              steps={["Enter details", "Review and Confirm"]}
              currentStep={step}
            />
          </div>
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 cursor-pointer">
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {step == 1 ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="profile_name">Profile Name</Label>
                <div className="relative">
                  <Input
                    id="profile_name"
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
                    A profile with this name already exists. Please choose
                    another one.
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <div className="font-[500] text-sm">
                  {searchQuery.selectedResult ? "Assigned" : "Assign"} FB
                  Account
                </div>
                <div className="relative w-full">
                  <SearchWrapper
                    searchQuery={searchQuery}
                    onSearchQueryChange={handleSearchQueryChange}
                    onSearchFocus={handleSearchFocus}
                    onRemoveSelected={handleRemoveSelected}
                    showResults={showResults}
                    setShowResults={setShowResults}
                    disabled={isActionDisabled}
                    SelectedRenderer={
                      <>
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
                          {searchQuery.selectedResult?.fb_owner_name}
                        </div>
                      </>
                    }
                    ResultsRenderer={
                      <AssignFBSearchResults
                        result={searchQuery.result}
                        handleSelectItem={handleSelectItem}
                      />
                    }
                  />
                </div>
                {searchQuery.selectedResult && (
                  <div className="font-normal text-muted-foreground text-sm">
                    Recruiter:{" "}
                    {searchQuery.selectedResult?.recruited_by.full_name}
                  </div>
                )}
              </div>

              {hasAccessToMarketingApiAccessToken &&
                searchQuery.selectedResult && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="app_secret_key">App Secret Key</Label>
                      <Input
                        id="app_secret_key"
                        className="border h-8 px-2 py-1 rounded w-full"
                        disabled={isActionDisabled}
                        value={form.app_secret_key || ""}
                        onChange={(e) =>
                          handleInputChange("app_secret_key", e.target.value)
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="marketing_api_access_token">
                        Extended Access Token
                      </Label>
                      <Textarea
                        id="marketing_api_access_token"
                        className={cn("border h-fit px-2 py-1 rounded w-full")}
                        disabled={isActionDisabled}
                        value={form.marketing_api_access_token || ""}
                        onChange={handleAccessTokenStateChange}
                      />
                      {accessTokenState.isChecking && (
                        <div className="flex gap-2 items-center text-sm">
                          <Loader2 className="animate-spin w-4" />
                          <div>Checking access token</div>
                        </div>
                      )}
                      {accessTokenState.title &&
                        !accessTokenState.isChecking && (
                          <div
                            className={cn(
                              "flex gap-2 text-sm",
                              accessTokenState.isValid
                                ? "items-center text-green-500"
                                : "bg-red-50 p-2 rounded text-red-500"
                            )}
                          >
                            <div className="flex-shrink-0">
                              {accessTokenState.isValid ? (
                                <div className="bg-green-500 rounded-full">
                                  <Check className="text-white h-4 w-4" />
                                </div>
                              ) : (
                                <TriangleAlert className="w-5" />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold">
                                {accessTokenState.title}
                              </div>
                              <div>{accessTokenState.description}</div>
                            </div>
                          </div>
                        )}
                    </div>
                  </>
                )}

              <div className="grid gap-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  className="border h-8 px-2 py-1 rounded w-full"
                  disabled={isActionDisabled}
                  value={form.remarks || ""}
                  onChange={(e) => handleInputChange("remarks", e.target.value)}
                />
              </div>
            </>
          ) : (
            <div className="grid gap-4 px-1 text-sm">
              <div>
                <div className="text-muted-foreground">Profile Name</div>
                {form.profile_name && <div>{form.profile_name}</div>}
              </div>

              <div>
                <div className="text-muted-foreground">Assigned FB Account</div>
                {searchQuery.selectedResult ? (
                  <div>{searchQuery.selectedResult?.fb_owner_name}</div>
                ) : (
                  "None"
                )}
              </div>

              {searchQuery.selectedResult &&
                hasAccessToMarketingApiAccessToken && (
                  <>
                    <div>
                      <div className="text-muted-foreground">
                        App Secret Key
                      </div>
                      {form.app_secret_key ? (
                        <div>{form.app_secret_key}</div>
                      ) : (
                        "None"
                      )}
                    </div>

                    <div className="grid">
                      <div className="text-muted-foreground">
                        Extended Access Token
                      </div>
                      {form.marketing_api_access_token ? (
                        <Textarea
                          className="border-none h-fit outline-none p-0 resize-none"
                          defaultValue={form.marketing_api_access_token}
                        ></Textarea>
                      ) : (
                        "None"
                      )}
                    </div>
                  </>
                )}

              <div className="grid">
                <div className="text-muted-foreground">Remarks</div>
                {form.remarks ? <div>{form.remarks}</div> : "None"}
              </div>
            </div>
          )}

          <DialogFooter>
            {["Back", "Next"].map((value, idx) => (
              <Button
                key={value}
                className={cn("cursor-pointer", step == idx + 1 && "hidden")}
                disabled={
                  isActionDisabled || isExisting || isSearching || !canSave
                }
                onClick={() => onUpdateStep(idx + 1)}
                type="button"
                variant={value == "Back" ? "outline" : "default"}
              >
                {value}
              </Button>
            ))}
            <Button
              className={cn("cursor-pointer", step == 1 && "hidden")}
              type="submit"
              disabled={
                isActionDisabled || isExisting || isSearching || !canSave
              }
            >
              {isActionDisabled ? "Saving..." : "Continue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

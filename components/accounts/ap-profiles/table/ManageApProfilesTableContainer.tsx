"use client";
import {
  ChangeEvent,
  FormEvent,
  startTransition,
  useEffect,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ManageApProfilesTable } from "./ManageApProfilesTable";
import { ManageApProfilesDialog } from "../dialog/ManageApProfilesDialog";
import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/shared/pagination/route-based/Pagination";
import { SearchQuery } from "@/components/otp-generator/type";
import { ApProfilesService } from "@/lib/features/ap-profiles/ApProfilesService";
import { ApiResponseProps } from "@/database/query";
import { useDebouncedCallback } from "use-debounce";
import { ApProfilesSearchResults } from "../search/ApProfilesSearchResults";
import { SearchWrapper } from "../search/SearchWrapper";
import { Profile } from "../type";
import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
import { CryptoClientService } from "@/lib/features/security/cryptography/CryptoClientService";

type ManageApProfilesTableContainerProps = {
  response: ApiResponseProps & {
    pagination?: PaginationProps;
  };
  hasAccessToMarketingApiAccessToken: boolean;
};

type Pagination = { page: number; limit: number };

type ProfileForm = {
  profile_name: string;
  fb_account_id?: number;
  marketing_api_access_token: string;
  app_secret_key: string;
  remarks?: string;
};

export function ManageApProfilesTableContainer({
  response,
  hasAccessToMarketingApiAccessToken,
}: ManageApProfilesTableContainerProps) {
  const profilesService = new ApProfilesService();
  const searchParamsManager = new SearchParamsManager();

  const searchParams = useSearchParams();
  const router = useRouter();

  const searchParamCurrentPage = response.pagination?.page;
  const searchParamTotalPages = response.pagination?.total_pages;
  const searchParamLimit = response.pagination?.limit || 10;

  const showToast = (isSuccess: boolean, message: string) => {
    if (isSuccess) {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  const [editingData, setEditingData] = useState<Partial<Profile>>({});
  const [form, setForm] = useState<ProfileForm>({
    profile_name: "",
    fb_account_id: undefined,
    marketing_api_access_token: "",
    app_secret_key: "",
    remarks: "",
  });
  const [tableData, setTableData] = useState<Profile[]>(response.data);
  const [open, setOpen] = useState(false);
  const [canSave, setCanSave] = useState(false);
  const [isSubmitInProgress, setIsSubmitInProgress] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({
    query: "",
    isSearching: false,
    result: { data: [], isSuccess: false, message: "" },
    selectedResult: null,
  });

  useEffect(() => {
    setTableData(response.data);
  }, [response.data]);

  const handleInputChange = (name: string, value: string | number) => {
    if (!canSave) {
      setCanSave(true);
    }
    setForm((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSearchDebounce = useDebouncedCallback(async (data: string) => {
    if (/^\s+$/.test(data) || !data) {
      setShowResults(false);
      return;
    }
    setSearchQuery({ ...searchQuery, isSearching: true });
    const response = await profilesService.find({
      method: "find-one",
      searchKeyword: data,
    });
    setSearchQuery({ ...searchQuery, result: response, isSearching: false });
    setShowResults(true);
  }, 500);

  const handleSearchQueryChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery({ ...searchQuery, query: ev.target.value });
    if (!ev.target.value) return;
    handleSearchDebounce(ev.target.value);
  };

  const handleSearchFocus = () => {
    if (searchQuery.result.data?.length) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleSelectItem = (item: Profile) => {
    setSearchQuery((prevState: any) => ({
      ...prevState,
      query: "",
      selectedResult: item,
    }));

    setTableData([
      {
        row_id: 1,
        ...item,
      },
    ]);
    setShowResults(false);
  };

  const handleModifyEditingData = (params: {
    marketing_api_access_token?: string;
    app_secret_key?: string;
  }) => {
    setEditingData((prevState) => ({
      ...prevState,
      ...params,
    }));
  };

  const buildPayload = (
    isUpdateMode: boolean,
    editingData: Partial<Profile>
  ) => {
    if (!editingData) return {};
    const payload: any = {};

    if (form.profile_name !== editingData.profile_name) {
      if (!isUpdateMode) {
        payload.profile_name = form.profile_name;
      } else {
        payload.profile_name = editingData.profile_name;
        payload.new_profile_name = form.profile_name;
      }
    }

    if (!isUpdateMode) {
      payload.fb_account_id = form.fb_account_id;
    } else {
      payload.fb_account_id = editingData.fb_account?.id;
    }

    if (
      form.marketing_api_access_token !== editingData.marketing_api_access_token
    ) {
      if (!isUpdateMode) {
        payload.fb_account_id = form.fb_account_id;
      } else {
        payload.fb_account_id = editingData.fb_account?.id;
      }
      payload.marketing_api_access_token = form.marketing_api_access_token;
    }

    if (form.app_secret_key !== editingData.app_secret_key) {
      if (!isUpdateMode) {
        payload.fb_account_id = form.fb_account_id;
      } else {
        payload.fb_account_id = editingData.fb_account?.id;
      }
      payload.app_secret_key = form.app_secret_key;
    }

    // payload.marketing_api_access_token = form.marketing_api_access_token;
    // payload.app_secret_key = form.app_secret_key;

    if (
      form.fb_account_id !== editingData.fb_account?.id &&
      typeof form.fb_account_id !== "undefined"
    ) {
      if (!isUpdateMode) {
        payload.fb_account_id = form.fb_account_id;
      } else {
        payload.fb_account_id = editingData.fb_account?.id || 0;
        payload.new_fb_account_id =
          form.fb_account_id !== 0 ? form.fb_account_id : 0;
      }
    }

    if (form.remarks !== editingData.remarks) {
      payload.remarks = form.remarks;
    }

    // cleanups
    if (payload.new_fb_account_id == 0) {
      delete payload["marketing_api_access_token"];
      delete payload["app_secret_key"];
    }

    return payload;
  };

  const handleSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const isUpdateMode = Object.keys(editingData).length >= 1;

    const payload = buildPayload(isUpdateMode, editingData);
    setIsSubmitInProgress(true);

    const response = isUpdateMode
      ? await profilesService.update({ id: editingData.id, ...payload })
      : await profilesService.post(payload);
    setIsSubmitInProgress(false);
    if (!response.isSuccess) {
      showToast(false, response.message);
      return setOpen(false);
    }

    if (isUpdateMode) {
      handleUpdateEntry(response, payload);
    } else {
      handleNewEntry(response);
    }
    showToast(true, response.message);
    setOpen(false);
  };

  const handleNewEntry = async (response: ApiResponseProps) => {
    const { data } = response;
    const createdBy = data[0].created_by;
    const updatedForm = {
      id: data[0].id,
      row_id: 1,
      profile_name: form.profile_name,
      fb_account: {
        id: data[0].fb_account.id,
        fb_owner_name: data[0].fb_account.fb_owner_name,
        username: data[0].fb_account.username,
        marketing_api_access_token:
          data[0].fb_account.marketing_api_access_token,
        app_secret_key: data[0].fb_account.app_secret_key,
        recruited_by: {
          full_name: data[0].fb_account.recruited_by?.full_name,
        },
      },
      created_by: {
        full_name: createdBy.full_name,
        team_name: createdBy.team_name,
      },
      created_at: data[0].created_at,
      remarks: form.remarks,
      status: data[0].status,
    };

    if (!Object.keys(data[0].fb_account).length) {
      updatedForm["fb_account"] = {} as any;
    }

    setTableData((prevData: any[]) => [
      updatedForm,
      ...prevData.map((row) => ({
        ...row,
        row_id: row.row_id + 1, // increment each old row_id by 1
      })),
    ]);
    resetForm();
  };

  const handleUpdateEntry = async (
    response: ApiResponseProps,
    payload: any
  ) => {
    // const tokens = await getTokens({
    //   app_secret_key: payload.app_secret_key,
    //   marketing_api_access_token: payload.marketing_api_access_token,
    //   type: "encrypt",
    // });

    // const marketingApiAccessToken = tokens["marketing_api_access_token"]
    //   ? tokens["marketing_api_access_token"]
    //   : form.marketing_api_access_token;
    // const appSecretKey = tokens["app_secret_key"]
    //   ? tokens["app_secret_key"]
    //   : form.app_secret_key;

    setTableData((prevData: Profile[]) =>
      prevData.map((item) => {
        const payloadLength = Object.keys(payload).length;
        const hasOnlyRemarks = payloadLength === 1 && "remarks" in payload;
        const hasSetNewFbAccount =
          "new_fb_account_id" in payload && payload.new_fb_account_id !== 0;
        const hasRemovedFbAccount =
          "new_fb_account_id" in payload && payload.new_fb_account_id === 0;
        const hasMarketingApiAccessToken =
          "marketing_api_access_token" in payload;
        const hasAppSecretKey = "app_secret_key" in payload;

        // if has set new fb account in payload, use response to propagate.
        // if has marketing api access token in payload, destructure and modify the marketing_api_access_token and app_secret_key.
        let fbAccount: any = {};
        if (hasSetNewFbAccount) {
          fbAccount = response.data[0].fb_account;
        }

        if (hasMarketingApiAccessToken || hasAppSecretKey) {
          fbAccount = {
            ...fbAccount,
            marketing_api_access_token:
              response.data[0].marketing_api_access_token,
            app_secret_key: response.data[0].app_secret_key,
          };
        }

        if ((!hasRemovedFbAccount && !hasSetNewFbAccount) || hasOnlyRemarks) {
          fbAccount = { ...item.fb_account, ...fbAccount };
        }

        const output =
          item.id === editingData.id
            ? {
                ...item,
                ...form,
                fb_account: fbAccount,
                status:
                  hasSetNewFbAccount || hasRemovedFbAccount
                    ? response.data[0].status
                    : item.status,
              }
            : item;
        return output;
      })
    );
    resetForm();
  };

  const handleEditChange = async (id: number | null) => {
    const selectedProfile = tableData.find(
      (data: { id: number }) => data.id === id
    ) as any;

    let tokens: any = {};

    if (selectedProfile.fb_account) {
      tokens = await getTokens({
        app_secret_key: selectedProfile.fb_account.app_secret_key,
        marketing_api_access_token:
          selectedProfile.fb_account.marketing_api_access_token,
        type: "decrypt",
      });
    }

    setEditingData({
      ...selectedProfile,
      ...tokens,
    });

    if (selectedProfile) {
      setForm({
        ...selectedProfile,
        ...tokens,
      });
      setOpen(true);
    }
  };

  const handlePagination = (page: number, limit: number) => {
    const urlQuery = new URLSearchParams();
    urlQuery.set("page", String(page));
    urlQuery.set("limit", String(limit));
    if (searchParamLimit !== limit) {
      urlQuery.set("page", "1");
    }
    router.push(`?${urlQuery.toString()}`);
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
    setShowResults(false);
    const page = searchParams.get("page") || "";
    const limit = searchParams.get("limit") || "";
    const newRouteQuery = searchParamsManager.refreshWithCacheBuster({
      page,
      limit,
    });
    router.push(`?${newRouteQuery.toString()}`);
  };

  const handleNewProfile = () => {
    setEditingData({});
    resetForm();
    setOpen(true);
  };

  const resetForm = () => {
    setForm({
      profile_name: "",
      fb_account_id: undefined,
      marketing_api_access_token: "",
      app_secret_key: "",
      remarks: "",
    });
  };

  useEffect(() => {
    if (!open) {
      setCanSave(false);
      startTransition(() => {
        setEditingData({});
      });
    }
  }, [open]);

  return (
    <>
      <ManageApProfilesDialog
        form={form}
        open={open}
        canSave={canSave}
        setOpen={setOpen}
        editingData={editingData}
        handleSubmit={handleSubmit}
        handleInputChange={handleInputChange}
        handleModifyEditingData={handleModifyEditingData}
        isActionDisabled={isSubmitInProgress}
        hasAccessToMarketingApiAccessToken={hasAccessToMarketingApiAccessToken}
      />
      <div className="flex justify-start gap-2 2xl:w-1/3 mt-4 w-[40%]">
        <Button
          className="cursor-pointer h-8 text-white"
          variant="default"
          onClick={handleNewProfile}
        >
          New Profile Entry
        </Button>

        <div className="relative w-full">
          <SearchWrapper
            searchQuery={searchQuery}
            onSearchQueryChange={handleSearchQueryChange}
            onSearchFocus={handleSearchFocus}
            onRemoveSelected={handleRemoveSelected}
            showResults={showResults}
            setShowResults={setShowResults}
            SelectedRenderer={
              <div className="text-sm">
                {searchQuery.selectedResult?.profile_name}
              </div>
            }
            ResultsRenderer={
              <ApProfilesSearchResults
                result={searchQuery.result}
                handleSelectItem={handleSelectItem}
              />
            }
          />
        </div>
      </div>
      <ScrollArea className="h-[75dvh] mt-4">
        <ManageApProfilesTable
          data={tableData}
          handleEditChange={handleEditChange}
        />

        <Pagination
          currentPage={Number(searchParamCurrentPage)}
          limit={searchParamLimit}
          total_pages={Number(searchParamTotalPages)}
          handlePagination={handlePagination}
        />
      </ScrollArea>
    </>
  );
}

export const getTokens = async (params: {
  app_secret_key?: string;
  marketing_api_access_token?: string;
  type: "encrypt" | "decrypt";
}) => {
  const decipher = new CryptoClientService();
  const tokens: any = {};

  const { app_secret_key, marketing_api_access_token } = params;
  const sensitiveData: any = {
    app_secret_key,
    marketing_api_access_token,
  };

  if (params.type === "encrypt") {
    for (const prop of Object.keys(sensitiveData)) {
      const value = sensitiveData[prop];
      if (value) {
        const { isSuccess, encryptedData, message } = await decipher.encrypt({
          data: value, // Decrypt
        });
        tokens[prop] = isSuccess ? encryptedData : message;
      }
    }
  } else {
    for (const prop of Object.keys(sensitiveData)) {
      const value = sensitiveData[prop];
      if (value) {
        const { isSuccess, decryptedData, message } = await decipher.decrypt({
          data: value, // Decrypt
        });
        tokens[prop] = isSuccess ? decryptedData : message;
      }
    }
  }

  return tokens;
};

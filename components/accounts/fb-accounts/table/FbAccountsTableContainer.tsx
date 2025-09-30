"use client";
import {
  ChangeEvent,
  FormEvent,
  startTransition,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { FbAccountsTable } from "./FbAccountsTable";
import { FbAccountsDialog } from "../dialog/FbAccountsDialog";
import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/shared/pagination/route-based/Pagination";
import { SearchQuery } from "@/components/otp-generator/type";
import { ApiResponseProps } from "@/database/query";
import { useDebouncedCallback } from "use-debounce";
import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";
import { FbAccountsService } from "@/lib/features/fb-accounts/FbAccountsService";
import { ApplyFilter, FBAccount, FBAccountForm, Option } from "../type";
import { CryptoClientService } from "@/lib/features/security/cryptography/CryptoClientService";
import { SearchWrapper } from "../../ap-profiles/search/SearchWrapper";
import { FbAccountsSearchResults } from "../search/FbAccountsSearchResults";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
import { FbAccountsFilter } from "../filter/FbAccountsFilter";

type FbAccountsTableContainerProps = {
  response: ApiResponseProps & { pagination?: PaginationProps };
  recruiters: Option[];
  isSuperOrAdmin: boolean;
};

type Pagination = { page: number; limit: number };

export function FbAccountsTableContainer({
  response,
  recruiters,
  isSuperOrAdmin,
}: FbAccountsTableContainerProps) {
  const fbAccountsService = new FbAccountsService();
  const cryptoClientService = new CryptoClientService();
  const searchParamsManager = new SearchParamsManager();

  const router = useRouter();
  const searchParams = useSearchParams();

  const searchParamCurrentPage = response.pagination?.page;
  const searchParamTotalPages = response.pagination?.total_pages;
  const searchParamLimit = response.pagination?.limit || 10;

  // filters
  const recruiter = searchParams.get("recruiter") || "";
  const splittedRecruiter = recruiter !== "" ? recruiter.split(",") : [];
  const status = searchParams.get("status") as
    | "active"
    | "available"
    | undefined;

  const showToast = (isSuccess: boolean, message: string) => {
    if (isSuccess) {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  const [editingData, setEditingData] = useState<Partial<FBAccount>>({});
  const [form, setForm] = useState<Partial<FBAccountForm>>({});
  const [tableData, setTableData] = useState<FBAccount[]>(response.data);
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

  const memoizedTableData = useMemo(() => tableData, [tableData]);

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
    const response = await fbAccountsService.find({
      method: "find-any",
      searchKeyword: data,
    });
    setSearchQuery({ ...searchQuery, result: response, isSearching: false });
    setShowResults(true);
  }, 500);

  const handleSearchQueryChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery({ ...searchQuery, query: ev.target.value });
    if (ev.target.value) {
      handleSearchDebounce(ev.target.value);
    }
  };

  const handleSearchFocus = () => {
    if (searchQuery.result.data?.length) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleSelectItem = (item: any) => {
    setSearchQuery((prevState: any) => ({
      ...prevState,
      query: "",
      selectedResult: item,
    }));

    setTableData([item]);
    setShowResults(false);
  };

  const buildPayload = () => {
    if (!editingData) return {};

    const fields: (keyof typeof form)[] = [
      "fb_owner_name",
      "email_address",
      "contact_no",
      "username",
      "password",
      "app_2fa_key",
      "recovery_code",
      "remarks",
    ];

    return fields.reduce<any>((acc, key) => {
      if (form[key] !== editingData[key]) {
        acc[key] = form[key];
      }
      return acc;
    }, {});
  };

  const handleSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    const payload = buildPayload();
    setIsSubmitInProgress(true);
    const isUpdateMode = Object.keys(editingData).length >= 1;

    const response = isUpdateMode
      ? await fbAccountsService.update({ id: editingData.id, ...payload })
      : await fbAccountsService.post(payload);
    setIsSubmitInProgress(false);
    if (!response.isSuccess) {
      showToast(false, response.message);
      return setOpen(false);
    }

    if (isUpdateMode) {
      handleUpdateEntry(response);
    } else {
      handleNewEntry(response);
    }
    showToast(true, response.message);
    setOpen(false);
  };

  const handleNewEntry = (response: ApiResponseProps) => {
    const { data } = response;
    const recruited_by = data[0].recruited_by;
    const response2faKey = response.data[0]?.app_2fa_key;
    const updatedForm = {
      id: data[0].id,
      row_id: 1,
      username: form.username,
      password: form.password,
      fb_owner_name: form.fb_owner_name,
      recruited_by: {
        full_name: recruited_by.full_name,
        team_name: recruited_by.team_name,
      },
      app_2fa_key: response2faKey,
      recovery_code: form.recovery_code,
      created_at: data[0].created_at,
      status: data[0].status,
    };

    setTableData((prevData: any[]) => [
      updatedForm,
      ...prevData.map((row) => ({
        ...row,
        row_id: row.row_id + 1, // increment each old row_id by 1
      })),
    ]);
    resetForm();
  };

  const resetForm = () => {
    setForm({
      fb_owner_name: "",
      username: "",
      password: "",
      app_2fa_key: "",
      recovery_code: "",
    });
  };

  const handleUpdateEntry = (response: ApiResponseProps) => {
    setTableData((prevData: any[]) =>
      prevData.map((item) => {
        const secretKeyHasChanged = editingData.app_2fa_key != form.app_2fa_key;
        const output =
          item.id === editingData.id
            ? {
                ...item,
                ...form,
                app_2fa_key: secretKeyHasChanged
                  ? response.data[0].app_2fa_key
                  : item.app_2fa_key,
              }
            : item;
        return output;
      })
    );
    resetForm();
  };

  const handleEditChange = async (id: number) => {
    const selectedAccount = tableData.find(
      (data: { id: number }) => data.id === id
    ) as any;

    const secretKey = await cryptoClientService.decrypt({
      data: selectedAccount.app_2fa_key,
    });

    setEditingData({
      ...selectedAccount,
      app_2fa_key: secretKey.decryptedData,
    });
    if (selectedAccount) {
      setForm({
        ...selectedAccount,
        app_2fa_key: secretKey.decryptedData,
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

    if (recruiter) {
      urlQuery.set("recruiter", recruiter);
    }

    if (status) {
      urlQuery.set("status", status);
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

  const handleApplyFilter = ({
    selectedRecruiter,
    selectedStatus,
  }: ApplyFilter) => {
    const joinedRecruiter = selectedRecruiter.join(",");
    const page = searchParams.get("page");
    const limit = searchParams.get("limit") || "";
    const recruiter = joinedRecruiter.length ? joinedRecruiter : "";
    const status = selectedStatus !== "show-all" ? selectedStatus : "";
    const newRouteQuery = searchParamsManager.refreshWithCacheBuster({
      page: page ? "1" : "", //if there's a page param then set to 1 else do not include
      limit,
      willCache: false,
    });

    if (recruiter) {
      newRouteQuery.set("recruiter", recruiter);
    }

    if (status) {
      newRouteQuery.set("status", status);
    }
    router.push(`?${newRouteQuery.toString()}`);
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
    <div className="overflow-auto w-full">
      <FbAccountsDialog
        form={form}
        open={open}
        canSave={canSave}
        setOpen={setOpen}
        editingData={editingData}
        handleSubmit={handleSubmit}
        handleInputChange={handleInputChange}
        isActionDisabled={isSubmitInProgress}
      />
      <div className="flex justify-start gap-2 mt-4 w-[40%]">
        <Button
          className="cursor-pointer h-8 text-white"
          variant="default"
          onClick={handleNewProfile}
        >
          New Fb Account Entry
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
                {searchQuery.selectedResult?.fb_owner_name}
              </div>
            }
            ResultsRenderer={
              <FbAccountsSearchResults
                result={searchQuery.result}
                handleSelectItem={handleSelectItem}
              />
            }
          />
        </div>
        <FbAccountsFilter
          recruiters={recruiters}
          onApplyFilter={handleApplyFilter}
          searchParams={{ recruiter: splittedRecruiter, status: status }}
          isSuperOrAdmin={isSuperOrAdmin}
        />
      </div>
      <ScrollArea className="h-[75dvh] mt-4 relative">
        <FbAccountsTable
          data={memoizedTableData}
          handleEditChange={handleEditChange}
        />

        <Pagination
          currentPage={Number(searchParamCurrentPage)}
          limit={searchParamLimit}
          total_pages={Number(searchParamTotalPages)}
          handlePagination={handlePagination}
          className="fixed right-0 w-full"
        />

        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}

"use client";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FbAccountsTable } from "./FbAccountsTable";
import { FbAccountsDialog } from "../dialog/FbAccountsDialog";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/pagination/route-based/Pagination";
import { SearchQuery } from "@/components/otp-generator/type";
import { ApiResponseProps } from "@/database/dbConnection";
import { useDebouncedCallback } from "use-debounce";
import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";
import { FbAccountsService } from "@/lib/features/fb-accounts/FbAccountsService";
import { FBAccount, FBAccountForm } from "../type";
import { CryptoClientService } from "@/lib/features/security/cryptography/CryptoClientService";
import { SearchWrapper } from "../../ap-profiles/search/SearchWrapper";
import { ApProfilesSearchResults } from "../../ap-profiles/search/ApProfilesSearchResults";
import { FbAccountsSearchResults } from "../search/FbAccountsSearchResults";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";

type FbAccountsTableContainerProps = {
  response: ApiResponseProps & { pagination?: PaginationProps };
};

type Pagination = { page: number; limit: number };

export function FbAccountsTableContainer({
  response,
}: FbAccountsTableContainerProps) {
  const fbAccountsService = new FbAccountsService();
  const cryptoClientService = new CryptoClientService();

  const router = useRouter();
  const searchParams = useSearchParams();

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
    handleSearchDebounce(ev.target.value);
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
      handleUpdateEntry();
    } else {
      handleNewEntry(response);
    }
    showToast(true, response.message);
    setOpen(false);
  };

  const handleNewEntry = (response: ApiResponseProps) => {
    const { data } = response;
    const recruited_by = data[0].recruited_by;
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

  const handleUpdateEntry = () => {
    setTableData((prevData: any[]) =>
      prevData.map((item) => {
        const output =
          item.id === editingData.id
            ? {
                ...item,
                ...form,
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
    setEditingData(selectedAccount);
    if (selectedAccount) {
      setForm({ ...selectedAccount, app_2fa_key: secretKey.decryptedData });
      setOpen(true);
    }
  };

  const handlePagination = (page: number, limit: number) => {
    router.push(`?page=${page}&limit=${limit}`);
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
    const triggerCache = Math.random()
      .toString(36)
      .substring(2, 5 + 2);
    const query = new URLSearchParams();

    if (page) query.set("page", page);
    if (limit) query.set("limit", limit);
    query.set("trigger", triggerCache);
    router.push(`?${query.toString()}`);
  };

  const handleNewProfile = () => {
    setEditingData({});
    resetForm();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) {
      setCanSave(false);
      setEditingData({});
    }
  }, [open]);

  const currentPage = response.pagination?.page;
  const total_pages = response.pagination?.total_pages;
  const limit = response.pagination?.limit || 10;

  return (
    <div className="w-full overflow-auto">
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
      <div className="flex justify-start gap-2 2xl:w-1/3 mt-4 w-[40%]">
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
      </div>
      <ScrollArea className="h-[75dvh] mt-4">
        <FbAccountsTable
          data={memoizedTableData}
          handleEditChange={handleEditChange}
        />

        <Pagination
          currentPage={Number(currentPage)}
          limit={limit}
          total_pages={Number(total_pages)}
          handlePagination={handlePagination}
        />
      </ScrollArea>
    </div>
  );
}

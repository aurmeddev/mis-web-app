"use client";
import { ChangeEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
import { useRouter, useSearchParams } from "next/navigation";
import { DomainsTable } from "./DomainsTable";
import { SearchInput } from "@/components/search/SearchInput";
import { SearchQuery } from "@/components/otp-generator/type";
import { useDebouncedCallback } from "use-debounce";
import { DomainManagerClientService } from "@/lib/features/domains/DomainManagerClientService";
import { Pagination } from "@/components/pagination/route-based/Pagination";
import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";
import { ApiResponseProps } from "@/database/dbConnection";

type UserManagementTableContainerProps = {
  response: ApiResponseProps & {
    pagination?: PaginationProps;
  };
  domainsData: AddDomainRecordRaw[];
};

export type AddDomainRecordRaw = AddDomainForm & {
  row_id?: number;
  id: number;
  domain_name: string;
  created_at: string;
  created_by: { full_name: string; team_name: string };
  status: "active" | "inactive";
};

type AddDomainForm = {
  ip_address: string;
  name: string;
};

export function DomainsTableContainer({
  response,
}: UserManagementTableContainerProps) {
  const domainsService = new DomainManagerClientService();
  const searchParamsManager = new SearchParamsManager();
  const searchParams = useSearchParams();
  const router = useRouter();

  const searchParamCurrentPage = response.pagination?.page;
  const searchParamTotalPages = response.pagination?.total_pages;
  const searchParamLimit = response.pagination?.limit || 50;

  const domainsData = response.data as AddDomainRecordRaw[];

  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [form, setForm] = useState<any>({
    ip_address: "",
    name: "",
    is_active: 0,
  });
  const [tableData, setTableData] = useState<AddDomainRecordRaw[]>(domainsData);
  const [isSubmitInProgress, setIsSubmitInProgress] = useState(false);
  const [hasStatusChanged, setHasStatusChanged] = useState(false);
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({
    query: "",
    isSearching: false,
    result: { data: [], isSuccess: false, message: "" },
    selectedResult: null,
  });

  const showToast = (isSuccess: boolean, message: string) => {
    if (!isSuccess) {
      toast.error(message);
    } else {
      toast.success(message);
    }
  };

  useEffect(() => {
    setTableData(domainsData);
  }, [domainsData]);

  const handleInputChange = (name: string, value: string) => {
    setForm((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleStatusChange = (value: string) => {
    const selectedRecord = tableData.find(
      (record: AddDomainRecordRaw) => record.id === editingRow
    );
    const originalValue = String(selectedRecord?.status);
    setForm((prevState: any) => ({
      ...prevState,
      status: value,
    }));
    // Detect if the value is actually different from original
    setHasStatusChanged(value !== originalValue);
  };

  const handleConfirm = async () => {
    const canRequest = hasAnyValueChanged();

    setIsSubmitInProgress(true);

    const { created_at, created_by, team_name, status, row_id, ...rest } = form;
    const updatePayload = rest as { id: number; domain_name: string };

    if (!isAddingNew && hasStatusChanged) {
      const payload: { id: number; is_active: 0 | 1 } = {
        id: rest.id,
        is_active: status == "active" ? 1 : 0,
      };

      const { isSuccess, message } = await domainsService.toggleStatus(payload);

      if (!isSuccess) {
        showToast(false, message);
        return;
      }
      showToast(true, message);
      setIsSubmitInProgress(false);
      handleUpdateEntry();
    }

    if (!canRequest.both) {
      resetFormState();
      return;
    }

    if (canRequest.domainName) {
      const response = isAddingNew
        ? await domainsService.post(form)
        : await domainsService.update(updatePayload);

      setIsSubmitInProgress(false);

      if (!response.isSuccess) {
        showToast(false, response.message);
        return;
      }

      if (isAddingNew) {
        handleNewEntry(response);
      } else {
        handleUpdateEntry();
      }

      showToast(true, response.message);
    }
  };

  const resetFormState = () => {
    setIsAddingNew(false);
    setEditingRow(null);
    // setForm(null);
    setIsSubmitInProgress(false);
  };

  const handleNewEntry = (response: any) => {
    const data: {
      id: number;
      created_by: Record<string, string>;
      created_at: string;
    } = response.data[0] as any;
    const updatedForm = {
      id: data.id,
      ...form,
      created_by: data.created_by,
      created_at: data.created_at,
      status: "active",
    };

    setTableData((prevData: AddDomainRecordRaw[]) => [
      updatedForm,
      ...prevData,
    ]);

    setIsAddingNew(false);
    setForm((prevState: any) => ({
      ...prevState,
      status: "active",
    }));
  };

  const handleUpdateEntry = () => {
    setTableData((prevData: AddDomainRecordRaw[]) =>
      prevData.map((item) =>
        item.id === form.id ? { ...item, ...form, status: form.status } : item
      )
    );

    setEditingRow(null);
    setForm(null);
  };

  const handleEditChange = (id: number | null) => {
    if (id === null) {
      setIsAddingNew(false);
    }
    const selectedWhitelistData = tableData.find(
      (data: { id: number }) => data.id == id
    );
    setEditingRow(id);
    if (selectedWhitelistData) {
      setForm(selectedWhitelistData);
    }
  };

  const handleAddDomainEntry = () => {
    setIsAddingNew(true);
    setForm(null);
    setEditingRow(null);
  };

  const hasAnyValueChanged = () => {
    if (isAddingNew) return { both: true, domainName: true };
    const selectedRecord = tableData.find(
      (record: AddDomainRecordRaw) => record.id === editingRow
    );

    if (selectedRecord) {
      const domain_name = selectedRecord["domain_name"];
      const status = selectedRecord["status"];

      const hasDomainNameChanged = domain_name !== form?.domain_name;
      const hasAnyValueChanged =
        hasDomainNameChanged || status !== form?.status;

      return {
        both: hasAnyValueChanged,
        domainName: hasDomainNameChanged,
      };
    }
    return {
      both: false,
      domainName: false,
    };
  };

  const handleSearchDebounce = useDebouncedCallback(
    async (searchText: string) => {
      if (/^\s+$/.test(searchText) || !searchText) {
        return;
      }
      setSearchQuery({ ...searchQuery, isSearching: true });
      const { data } = await domainsService.find({
        method: "find-one",
        searchKeyword: searchText,
      });
      setTableData(data);
      setSearchQuery({ ...searchQuery, isSearching: false });
    },
    500
  );

  const handleSearchQueryChange = (ev: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery({ ...searchQuery, query: ev.target.value });
    if (!ev.target.value) {
      const page = searchParams.get("page") || "";
      const limit = searchParams.get("limit") || "";
      const newRoute = searchParamsManager.refreshWithCacheBuster({
        page,
        limit,
      });
      router.push(`?${newRoute.toString()}`);
      return;
    }
    handleSearchDebounce(ev.target.value);
  };

  const handleSearchFocus = () => {};

  const handlePagination = (page: number, limit: number) => {
    const urlQuery = new URLSearchParams();
    urlQuery.set("page", String(page));
    urlQuery.set("limit", String(limit));
    if (searchParamLimit !== limit) {
      urlQuery.set("page", "1");
    }
    router.push(`?${urlQuery.toString()}`);
  };

  return (
    <>
      <div className="flex justify-start gap-2 sm:w-1/2 2xl:w-1/3 mt-4 w-1/3">
        <Button
          className="h-8"
          variant="default"
          onClick={handleAddDomainEntry}
        >
          New Domain Entry
        </Button>
        <div className="relative w-full">
          <SearchInput
            searchQuery={searchQuery}
            onSearchFocus={handleSearchFocus}
            onSearchQueryChange={handleSearchQueryChange}
            placeholder="Search a domain"
          />
        </div>
      </div>
      <ScrollArea className="h-[70dvh] mt-4">
        <DomainsTable
          form={form}
          data={tableData}
          addMode={isAddingNew}
          editingRow={editingRow}
          handleConfirm={handleConfirm}
          handleEditChange={handleEditChange}
          handleInputChange={handleInputChange}
          handleStatusChange={handleStatusChange}
          isActionDisabled={isSubmitInProgress}
        />
      </ScrollArea>
      <Pagination
        currentPage={Number(searchParamCurrentPage)}
        limit={searchParamLimit}
        total_pages={Number(searchParamTotalPages)}
        handlePagination={handlePagination}
      />
    </>
  );
}

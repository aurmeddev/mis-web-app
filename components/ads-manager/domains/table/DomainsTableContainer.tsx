"use client";
import {
  ChangeEvent,
  startTransition,
  useEffect,
  useOptimistic,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { ExternalToast, toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
import { useRouter, useSearchParams } from "next/navigation";
import { DomainsTable } from "./DomainsTable";
import { SearchQuery } from "@/components/otp-generator/type";
import { useDebouncedCallback } from "use-debounce";
import { DomainManagerClientService } from "@/lib/features/domains/DomainManagerClientService";
import { Pagination } from "@/components/shared/pagination/route-based/Pagination";
import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";
import { ApiResponseProps } from "@/database/query";
import { ImportCSVFileInput } from "@/components/shared/import-csv/ImportCSVFileInput";
import { DomainUtils } from "@/lib/utils/domain/DomainUtils";
import { DownloadLocalFile } from "@/components/shared/download/DownloadLocalFile";
import { SearchInputMemo } from "@/components/shared/search/SearchInput";
import { InternetBsApiClientService } from "@/lib/features/domains/domain-checker/internetbs-api/InternetBsApiClientService";
import { DomainsDialog } from "../dialog/DomainsDialog";

type UserManagementTableContainerProps = {
  response: ApiResponseProps & {
    pagination?: PaginationProps;
  };
  domainsData: DomainsRecordRaw[];
};

export type DomainsRecordRaw = DomainsForm & {
  row_id?: number;
  id: number;
  domain_name: string;
  created_at: string;
  created_by: { full_name: string; team_name: string };
  status: "active" | "inactive";
};

type DomainsForm = {
  ip_address: string;
  name: string;
};

type ImportData = { domain_name: string };

export type InternetBSInfo = {
  domain: string;
  expirationdate: string;
  registrationdate: string;
  paiduntil: string;
  autorenew: string;
  whoisprivacy: string;
  domainstatus: string;
  nameserver: Record<string, string>;
};

export function DomainsTableContainer({
  response,
}: UserManagementTableContainerProps) {
  const domainsService = new DomainManagerClientService();
  const searchParamsManager = new SearchParamsManager();
  const domainUtils = new DomainUtils();
  const internetbsService = new InternetBsApiClientService();

  const searchParams = useSearchParams();
  const router = useRouter();

  const searchParamCurrentPage = response.pagination?.page;
  const searchParamTotalPages = response.pagination?.total_pages;
  const searchParamLimit = response.pagination?.limit || 50;

  const domainsData = response.data as DomainsRecordRaw[];

  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [form, setForm] = useState<any>({
    ip_address: "",
    name: "",
    is_active: 0,
  });
  const [tableData, setTableData] = useState<DomainsRecordRaw[]>(domainsData);
  const [isSubmitInProgress, setIsSubmitInProgress] = useState(false);
  const [hasStatusChanged, setHasStatusChanged] = useState(false);
  const [isDomainsDialogOpen, setIsDomainsDialogOpen] = useState(false);
  const [processingDomain, setProcessingDomain] = useState<string>("");
  const [internetBsInfo, setInternetBsInfo] = useState<Partial<InternetBSInfo>>(
    {}
  );
  const [importData, setImportData] = useState<ImportData[]>([]);
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({
    query: "",
    isSearching: false,
    result: { data: [], isSuccess: false, message: "" },
    selectedResult: null,
  });

  useEffect(() => {
    setTableData(domainsData);
  }, [domainsData]);

  const showToast = (
    isSuccess: boolean,
    message: string,
    option?: ExternalToast
  ) => {
    if (!isSuccess) {
      toast.error(message, option);
    } else {
      toast.success(message, option);
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setForm((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleStatusChange = (value: string) => {
    const selectedRecord = tableData.find(
      (record: DomainsRecordRaw) => record.id === editingRow
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
    const { created_at, created_by, team_name, status, row_id, ...rest } = form;
    const updatePayload = rest as { id: number; domain_name: string };
    const isValidDomain = domainUtils.isValidDomain(rest.domain_name);

    if (!isValidDomain) {
      notifyInvalidDomain(rest.domain_name);
      return;
    }
    setIsSubmitInProgress(true);

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

    setTableData((prevData: DomainsRecordRaw[]) => [updatedForm, ...prevData]);

    setIsAddingNew(false);
    setForm((prevState: any) => ({
      ...prevState,
      status: "active",
    }));
  };

  const handleUpdateEntry = () => {
    setTableData((prevData: DomainsRecordRaw[]) =>
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
      (record: DomainsRecordRaw) => record.id === editingRow
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
      const rowIdData = data.length > 0 ? [{ row_id: 1, ...data[0] }] : data;
      setTableData(rowIdData);
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

  const handleSetFileData = (json: any) => {
    if (!json?.length) {
      toast.info("The CSV file is empty. Please add at least one domain.");
      return;
    }
    setImportData(json);
  };

  const handleFileValidate = (isValid: boolean) => {
    if (!isValid) {
      showToast(false, "Please upload a valid .csv file.");
    }
  };

  const notifyInvalidDomain = (domain: string) => {
    showToast(false, `${domain} is not a valid domain.`, { duration: 8000 });
  };

  const handleViewInternetbsInfo = async (domain: string) => {
    if (!domain) return;

    setProcessingDomain(domain);
    const { isSuccess, data, message } = await internetbsService.getDomainInfo({
      domain,
    });

    if (!isSuccess) {
      showToast(false, message);
      return;
    }

    const {
      autorenew,
      domainstatus,
      expirationdate,
      registrationdate,
      nameserver,
      paiduntil,
      whoisprivacy,
      status,
      message: failureMessage,
    } = data[0];

    if (status == "FAILURE") {
      showToast(false, failureMessage);
      return;
    }

    const info: InternetBSInfo = {
      autorenew,
      domain,
      domainstatus,
      expirationdate,
      registrationdate,
      nameserver,
      paiduntil,
      whoisprivacy,
    };

    setInternetBsInfo(info);
    startTransition(() => {
      setProcessingDomain("");
      setIsDomainsDialogOpen(true);
    });
  };

  const handleDomainsDialogOpenState = (isOpen: boolean) => {
    setIsDomainsDialogOpen(isOpen);
  };

  useEffect(() => {
    if (!importData.length) return;
    const hasDomainNameProperty = importData.some(
      (data) => "domain_name" in data
    );
    if (!hasDomainNameProperty) {
      toast.info(
        "The CSV file is invalid. Please make sure you are using the correct file format."
      );
      return;
    }

    const uploadDomains = async () => {
      const filteredData = importData.filter((item) => item.domain_name);

      for (const domain of filteredData) {
        const isValidDomain = domainUtils.isValidDomain(domain.domain_name);

        if (!isValidDomain) {
          notifyInvalidDomain(domain.domain_name);
          continue;
        }

        const { isSuccess, data, message } = await domainsService.post({
          domain_name: domain.domain_name,
        });

        if (!isSuccess) {
          showToast(false, message);
          continue;
        }

        setTableData((prevState) => [
          { ...data[0], domain_name: domain.domain_name },
          ...prevState,
        ]);
      }
    };
    toast.promise(uploadDomains, {
      loading: "Uploading domains...",
      success: "Upload complete!",
      error: "Upload failed",
      position: "bottom-left",
    });
  }, [importData]);

  return (
    <>
      <DomainsDialog
        open={isDomainsDialogOpen}
        onDialogOpenState={handleDomainsDialogOpenState}
        internetBsInfo={internetBsInfo}
      />
      <div className="flex justify-start gap-2 mt-4 w-full">
        <Button
          className="cursor-pointer h-9"
          variant="default"
          onClick={handleAddDomainEntry}
        >
          New Domain Entry
        </Button>
        <div className="relative w-[30%]">
          <SearchInputMemo
            className="h-9"
            searchQuery={searchQuery}
            onSearchFocus={handleSearchFocus}
            onSearchQueryChange={handleSearchQueryChange}
            placeholder="Search a domain"
          />
        </div>

        <ImportCSVFileInput
          className="h-9"
          onFileValidate={handleFileValidate}
          onSetFileData={handleSetFileData}
          title="Upload Domains"
        />

        <div className="self-center w-1/2">
          <DownloadLocalFile
            fileNameWithExt="upload-domains-format.csv"
            text="Download template"
            url={"/downloadable/upload-domains-format.csv"}
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
          processingDomain={processingDomain}
          onViewInternetbsInfo={handleViewInternetbsInfo}
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

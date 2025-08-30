"use client";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ManageApProfilesTable } from "./ManageApProfilesTable";
import { ManageApProfilesDialog } from "../dialog/ManageApProfilesDialog";
import { useRouter } from "next/navigation";
import { Pagination } from "@/components/pagination/route-based/Pagination";
import { SearchQuery } from "@/components/otp-generator/type";
import { ApProfilesService } from "@/lib/features/ap-profiles/ApProfilesService";
import { ApiResponseProps } from "@/database/dbConnection";
import { useDebouncedCallback } from "use-debounce";
import { ApProfilesSearchResults } from "../search/ApProfilesSearchResults";
import { SearchWrapper } from "../search/SearchWrapper";
import { Profile } from "../type";
import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";

type ManageApProfilesTableContainerProps = {
  response: ApiResponseProps & { pagination?: PaginationProps };
};

type Pagination = { page: number; limit: number };

type ProfileForm = {
  profile_name: string;
  fb_account_id?: number;
  remarks?: "";
};

export function ManageApProfilesTableContainer({
  response,
}: ManageApProfilesTableContainerProps) {
  const profilesService = new ApProfilesService();

  const router = useRouter();
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
    remarks: "",
  });
  const [tableData, setTableData] = useState<Profile[]>(response.data);
  const [open, setOpen] = useState(false);
  const [canSave, setCanSave] = useState(false);
  const [isSubmitInProgress, setIsSubmitInProgress] = useState(false);
  const [hasStatusChanged, setHasStatusChanged] = useState(false);
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

  const handleStatusChange = (value: string) => {
    // const selectedRecord = tableData.find(
    //   (record: any) => record.id === editingRow
    // );
    // const originalValue = String(selectedRecord?.is_active);
    // setForm((prevState: any) => ({
    //   ...prevState,
    //   is_active: value,
    // }));
    // // Detect if the value is actually different from original
    // setHasStatusChanged(value !== originalValue);
  };

  const handleSearchDebounce = useDebouncedCallback(async (data: string) => {
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

    setTableData([item]);
    setShowResults(false);
  };

  const buildPayload = () => {
    if (!editingData) return {};

    const payload: any = {};

    if (form.profile_name !== editingData.profile_name) {
      payload.profile_name = form.profile_name;
    }

    // if (form.fb_account_id !== editingData.fb_account?.id) {
    //   payload.fb_account_id = form.fb_account_id
    // }

    payload.fb_account_id =
      form.fb_account_id || searchQuery.selectedResult?.fb_account_id;

    if (form.remarks !== editingData.remarks) {
      payload.remarks = form.remarks;
    }

    return payload;
  };

  const handleSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    const payload = buildPayload();
    console.log("");
    setIsSubmitInProgress(true);
    const isUpdateMode = Object.keys(editingData).length >= 1;

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

  const handleNewEntry = (response: ApiResponseProps) => {
    const { data } = response;
    const createdBy = data[0].created_by;
    const updatedForm = {
      id: data[0].id,
      row_id: 1,
      profile_name: form.profile_name,
      fb_account: {
        fb_owner_name: data[0].fb_account.fb_owner_name,
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
    setForm({ profile_name: "", fb_account_id: undefined, remarks: "" });
  };

  const handleUpdateEntry = (response: ApiResponseProps, payload: any) => {
    setTableData((prevData: any[]) =>
      prevData.map((item) => {
        const hasOnlyRemarks =
          Object.keys(payload).length === 1 && "remarks" in payload;

        const output =
          item.id === editingData.id
            ? {
                ...item,
                ...form,
                fb_account: hasOnlyRemarks
                  ? item.fb_account
                  : response.data[0].fb_account,
                status: response.data[0].status,
              }
            : item;
        return output;
      })
    );
    setForm({ profile_name: "", fb_account_id: undefined, remarks: "" });
  };

  const handleEditChange = (id: number | null) => {
    const selectedProfile = tableData.find(
      (data: { id: number }) => data.id === id
    ) as any;
    setEditingData(selectedProfile);
    if (selectedProfile) {
      setForm(selectedProfile);
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
    setTableData(response.data);
  };

  const handleNewProfile = () => {
    setEditingData({});
    setForm({ profile_name: "", fb_account_id: undefined, remarks: "" });
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
    <>
      <ManageApProfilesDialog
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
          currentPage={Number(currentPage)}
          limit={limit}
          total_pages={Number(total_pages)}
          handlePagination={handlePagination}
        />
      </ScrollArea>
    </>
  );
}

"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ManageApProfilesTable } from "./ManageApProfilesTable";
import { ManageApProfilesDialog } from "../dialog/ManageApProfilesDialog";
import { useRouter } from "next/navigation";
import { Pagination } from "@/components/pagination/route-based/Pagination";
import { SearchResult } from "@/components/search/SearchResult";
import { SearchInput } from "@/components/search/SearchInput";
import { SearchQuery } from "@/components/otp-generator/type";
import { ManageApProfilesSearchResults } from "../search/ManageApProfilesSearchResults";
import { ApProfilesService } from "@/lib/features/ap-profiles/ApProfilesService";
import { ApiResponseProps } from "@/database/dbConnection";

type ManageApProfilesTableContainerProps = {
  response: any;
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

  const [editingData, setEditingData] = useState<any>({});
  const [form, setForm] = useState<ProfileForm>({
    profile_name: "",
    fb_account_id: undefined,
    remarks: "",
  });
  const [tableData, setTableData] = useState<any>(response.data);
  const [isSubmitInProgress, setIsSubmitInProgress] = useState(false);
  const [hasStatusChanged, setHasStatusChanged] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({
    query: "",
    isSearching: false,
    result: { data: [], isSuccess: false, message: "" },
    selectedResult: null,
  });
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    setTableData(response.data);
  }, [response.data]);

  const handleInputChange = (name: string, value: string | number) => {
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

  const buildPayload = () => {
    if (!editingData) return {};

    const payload: any = {};

    if (form.profile_name !== editingData.profile_name) {
      payload.profile_name = form.profile_name;
    }

    if (form.fb_account_id !== editingData.fb_account?.id) {
      payload.fb_account_id = form.fb_account_id;
    }

    if (form.remarks !== editingData.remarks) {
      payload.remarks = form.remarks;
    }

    return payload;
  };

  const handleSubmit = async (ev: any) => {
    ev.preventDefault();

    const payload = buildPayload();
    // if (Object.keys(payload).length === 0) {
    //   toast.info("No changes detected");
    //   return;
    // }

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

        console.log(hasOnlyRemarks);
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
    );
    setEditingData(selectedProfile);
    if (selectedProfile) {
      setForm(selectedProfile);
      setOpen(true);
    }
  };

  const handlePagination = (page: number, limit: number) => {
    router.push(`?page=${page}&limit=${limit}`);
  };

  const currentPage = response.pagination?.page;
  const total_pages = response.pagination?.total_pages;
  const limit = response.pagination?.limit || 10;

  const handleNewProfile = () => {
    setEditingData({});
    setForm({ profile_name: "", fb_account_id: undefined, remarks: "" });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) {
      setEditingData({});
    }
  }, [open]);

  return (
    <>
      <ManageApProfilesDialog
        form={form}
        open={open}
        setOpen={setOpen}
        editingData={editingData}
        handleSubmit={handleSubmit}
        handleInputChange={handleInputChange}
        handleStatusChange={handleStatusChange}
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
          <SearchInput
            searchQuery={searchQuery}
            onSearchQueryChange={() => {}}
            onSearchFocus={() => {}}
          />
          {showResults && (
            <SearchResult setShowResults={setShowResults}>
              <ManageApProfilesSearchResults
                result={searchQuery.result}
                handleSelectItem={() => {}}
              />
            </SearchResult>
          )}
        </div>
      </div>
      <ScrollArea className="h-[75dvh] mt-4">
        <ManageApProfilesTable
          form={form}
          data={tableData}
          editingRow={editingData}
          handleEditChange={handleEditChange}
          handleInputChange={handleInputChange}
          handleStatusChange={handleStatusChange}
          isActionDisabled={isSubmitInProgress}
        />

        <Pagination
          currentPage={currentPage}
          limit={limit}
          total_pages={total_pages}
          handlePagination={handlePagination}
        />
      </ScrollArea>
    </>
  );
}

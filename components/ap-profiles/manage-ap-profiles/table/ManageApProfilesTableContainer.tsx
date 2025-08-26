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

  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
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

  const handleInputChange = (name: string, value: string) => {
    setForm((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleStatusChange = (value: string) => {
    const selectedRecord = tableData.find(
      (record: any) => record.id === editingRow
    );
    const originalValue = String(selectedRecord?.is_active);
    setForm((prevState: any) => ({
      ...prevState,
      is_active: value,
    }));
    // Detect if the value is actually different from original
    setHasStatusChanged(value !== originalValue);
  };

  const handleSubmit = async (ev: any) => {
    ev.preventDefault();

    setIsSubmitInProgress(true);
    const payload: ProfileForm = {
      profile_name: form.profile_name,
      fb_account_id: form.fb_account_id,
      remarks: form.remarks,
    };
    const response = await profilesService.post(payload);
    setIsSubmitInProgress(false);
    if (!response.isSuccess) {
      toast.error(response.message);
      return setOpen(false);
    }

    handleNewEntry(response);
    toast.success(response.message);
    setOpen(false);
  };

  const handleNewEntry = (response: ApiResponseProps) => {
    const { data } = response;
    const updatedForm = {
      row_id: 1,
      profile_name: form.profile_name,
      fb_account: {
        fb_owner_name: "",
      },
      created_by: {
        full_name: data[0].created_by.full_name,
        team_name: data[0].created_by.team_name,
      },
      created_at: data[0].created_at,
      remarks: form.remarks,
      status: data[0].status,
    };

    setTableData((prevData: any[]) => [
      updatedForm,
      ...prevData.map((row) => ({
        ...row,
        row_id: row.row_id + 1, // increment each old row_id by 1
      })),
    ]);
  };

  // const handleUpdateEntry = () => {
  //   setTableData((prevData: ManageApProfilesRecordRaw[]) =>
  //     prevData.map((item) =>
  //       item.id === form.id
  //         ? { ...item, ...form, is_active: Number(form.is_active) }
  //         : item
  //     )
  //   );

  //   setEditingRow(null);
  // };

  const handleEditChange = (id: number | null) => {
    // if (id === null) {
    //   setIsAddingNew(false);
    // }
    // const selectedWhitelistData = response.data.find(
    //   (data: { id: number }) => data.id === id
    // );
    // setEditingRow(id);
    // if (selectedWhitelistData) {
    //   setForm(selectedWhitelistData);
    // }
  };

  // const hasInputChanged = () => {
  //   if (isAddingNew) return true;
  //   const selectedRecord = tableData.find(
  //     (record: ManageApProfilesRecordRaw) => record.id === editingRow
  //   );

  //   if (selectedRecord) {
  //     const ip_address = selectedRecord["ip_address"];
  //     const name = selectedRecord["name"];
  //     const is_active = selectedRecord["is_active"];

  //     const hasChanged =
  //       ip_address !== form?.profile_name ||
  //       name !== form?.fb_account_id ||
  //       is_active !== form?.remarks;
  //     return hasChanged;
  //   }
  //   return false;
  // };

  const handlePagination = (page: number, limit: number) => {
    router.push(`?page=${page}&limit=${limit}`);
  };

  const currentPage = response.pagination?.page;
  const total_pages = response.pagination?.total_pages;
  const limit = response.pagination?.limit || 10;

  const handleNewProfile = () => {
    setForm({ profile_name: "", fb_account_id: undefined, remarks: "" });
    setOpen(true);
  };

  return (
    <>
      <ManageApProfilesDialog
        form={form}
        open={open}
        setOpen={setOpen}
        editingRow={editingRow}
        handleSubmit={handleSubmit}
        handleEditChange={handleEditChange}
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
          addMode={isAddingNew}
          editingRow={editingRow}
          handleConfirm={() => {}}
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

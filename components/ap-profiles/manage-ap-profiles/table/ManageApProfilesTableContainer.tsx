"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ManageApProfilesTable } from "./ManageApProfilesTable";
import { SearchInput } from "../search/SearchInput";
import { ManageApProfilesDialog } from "../dialog/ManageApProfilesDialog";
import { useRouter } from "next/navigation";
import { Pagination } from "@/components/pagination/route-based/Pagination";
import { SearchResult } from "@/components/search/SearchResult";

type ManageApProfilesTableContainerProps = {
  response: any;
};

export type ManageApProfilesRecordRaw = ManageApProfilesForm & {
  id: number;
  team_id: number;
  team_name: string;
  created_at: string;
  created_by: string;
  is_active: number;
};

type ManageApProfilesForm = {
  ip_address: string;
  name: string;
};

type Pagination = { page: number; limit: number };

export function ManageApProfilesTableContainer({
  response,
}: ManageApProfilesTableContainerProps) {
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
  const [form, setForm] = useState<any>({
    profile_name: "",
    fb_owner_name: "",
    username: "",
    password: "",
    long_2fa_key: "",
    recovery_codes: "",
    remarks: "",
    is_active: 2,
  });
  const [tableData, setTableData] = useState<any>(response.data);
  const [isSubmitInProgress, setIsSubmitInProgress] = useState(false);
  const [hasStatusChanged, setHasStatusChanged] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [open, setOpen] = useState(false);

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
      (record: ManageApProfilesRecordRaw) => record.id === editingRow
    );
    const originalValue = String(selectedRecord?.is_active);
    setForm((prevState: any) => ({
      ...prevState,
      is_active: value,
    }));
    // Detect if the value is actually different from original
    setHasStatusChanged(value !== originalValue);
  };

  const handleConfirm = async () => {
    const canRequest = hasInputChanged();
    setIsSubmitInProgress(true);

    const { created_at, created_by, team_name, is_active, row_id, ...rest } =
      form;

    const updatePayload = rest as any;

    // if (!isAddingNew && hasStatusChanged) {
    //   const payload: any = {
    //     ...rest,
    //     is_active: Number(is_active),
    //   };

    //   const { isSuccess, message } = await ipWhitelistService.setActive(
    //     payload
    //   );

    //   if (!isSuccess) {
    //     showToast(false, message);
    //     return;
    //   }
    // }

    if (!canRequest) {
      resetFormState();
      return;
    }

    // const response = isAddingNew
    //   ? await ipWhitelistService.post(form)
    //   : await ipWhitelistService.update(updatePayload);
    const response = { isSuccess: false, message: "", data: [] };

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
  };

  const resetFormState = () => {
    setIsAddingNew(false);
    setEditingRow(null);
    // setForm(null);
    setIsSubmitInProgress(false);
  };

  const handleNewEntry = (response: any) => {
    const data: { insertId: number } = response.data as any;
    const updatedForm = {
      id: data.insertId,
      ...form,
      is_active: 1,
    };

    setTableData((prevData: ManageApProfilesRecordRaw[]) => [
      updatedForm,
      ...prevData,
    ]);

    setIsAddingNew(false);
    setForm((prevState: any) => ({
      ...prevState,
      is_active: 1,
    }));
  };

  const handleUpdateEntry = () => {
    setTableData((prevData: ManageApProfilesRecordRaw[]) =>
      prevData.map((item) =>
        item.id === form.id
          ? { ...item, ...form, is_active: Number(form.is_active) }
          : item
      )
    );

    setEditingRow(null);
    setForm(null);
  };

  const handleEditChange = (id: number | null) => {
    if (id === null) {
      setIsAddingNew(false);
    }
    const selectedWhitelistData = response.data.find(
      (data: { id: number }) => data.id === id
    );
    setEditingRow(id);
    if (selectedWhitelistData) {
      setForm(selectedWhitelistData);
    }
  };

  const hasInputChanged = () => {
    if (isAddingNew) return true;
    const selectedRecord = tableData.find(
      (record: ManageApProfilesRecordRaw) => record.id === editingRow
    );

    if (selectedRecord) {
      const ip_address = selectedRecord["ip_address"];
      const name = selectedRecord["name"];
      const is_active = selectedRecord["is_active"];

      const hasChanged =
        ip_address !== form?.ip_address ||
        name !== form?.name ||
        is_active !== form?.is_active;
      return hasChanged;
    }
    return false;
  };

  const handleSearch = async (value: string) => {
    setIsSearching(true);
    if (!value) {
      setTableData(response.data);
      setIsSearching(false);
      return;
    }

    try {
      //   const { data } = await ipWhitelistService.find({ searchKey: value });
      const { data } = { data: [] };

      if (data?.length) {
        setTableData(data);
      }
    } finally {
      setIsSearching(false); // ✅ Always reset after request completes
    }
  };

  const handlePagination = (page: number, limit: number) => {
    router.push(`?page=${page}&limit=${limit}`);
  };

  const currentPage = response.pagination?.page;
  const total_pages = response.pagination?.total_pages;
  const limit = response.pagination?.limit || 10;

  return (
    <>
      <ManageApProfilesDialog
        form={form}
        rowData={[]}
        open={open}
        setOpen={setOpen}
        editingRow={editingRow}
        handleConfirm={handleConfirm}
        handleEditChange={handleEditChange}
        handleInputChange={handleInputChange}
        handleStatusChange={handleStatusChange}
        isActionDisabled={isSubmitInProgress}
      />
      <div className="flex justify-start gap-2 2xl:w-1/3 mt-4 w-[40%]">
        <Button
          className="cursor-pointer h-8 text-white"
          variant="default"
          onClick={() => setOpen(true)}
        >
          New Profile Entry
        </Button>
        <SearchInput
          placeholder="Search by profile"
          onSearch={handleSearch}
          isSearching={isSearching}
        />
        <SearchResult setShowResults={() => {}}>
          <div></div>
        </SearchResult>
      </div>
      <ScrollArea className="h-[75dvh] mt-4">
        <ManageApProfilesTable
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

"use client";
import { useState } from "react";
import { UserManagementTable } from "./UserManagementTable";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SearchInput } from "../search/SearchInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  UpdateUserIpWhitelistInfoParams,
  UpdateUserIpWhitelistStatusParams,
} from "@/lib/features/users/whitelist-ip/type/UserIpWhitelistProps";
import { UserIpWhitelistManager } from "@/lib/features/users/whitelist-ip/UserIpWhitelistManager";
import { UserIpWhitelistClientService } from "@/lib/features/users/whitelist-ip/UserIpWhitelistClientService";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
import { useRouter, useSearchParams } from "next/navigation";

type UserManagementTableContainerProps = {
  whiteListData: WhitelistRecordRaw[];
};

export type WhitelistRecordRaw = WhitelistForm & {
  id: number;
  team_id: number;
  team_name: string;
  created_at: string;
  created_by: string;
  is_active: number;
};

type WhitelistForm = {
  ip_address: string;
  name: string;
};

export function UserManagementTableContainer({
  whiteListData,
}: UserManagementTableContainerProps) {
  const ipWhitelistService = new UserIpWhitelistManager(
    new UserIpWhitelistClientService()
  );
  const searchParamsManager = new SearchParamsManager();
  const searchParams = useSearchParams();
  const route = useRouter();

  const showToast = (isSuccess: boolean, message: string) => {
    if (!isSuccess) {
      toast.error(message);
    } else {
      toast.success(message);
    }
  };

  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [form, setForm] = useState<any>({
    ip_address: "",
    name: "",
    is_active: 0,
  });
  const [tableData, setTableData] =
    useState<WhitelistRecordRaw[]>(whiteListData);
  const [isSubmitInProgress, setIsSubmitInProgress] = useState(false);
  const [hasStatusChanged, setHasStatusChanged] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleInputChange = (name: string, value: string) => {
    setForm((prevState: any) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleStatusChange = (value: string) => {
    const selectedRecord = tableData.find(
      (record: WhitelistRecordRaw) => record.id === editingRow
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

    const updatePayload = rest as UpdateUserIpWhitelistInfoParams;

    if (!isAddingNew && hasStatusChanged) {
      const payload: UpdateUserIpWhitelistStatusParams = {
        ...rest,
        is_active: Number(is_active),
      };

      const { isSuccess, message } = await ipWhitelistService.setActive(
        payload
      );

      if (!isSuccess) {
        showToast(false, message);
        return;
      }
    }

    if (!canRequest) {
      resetFormState();
      return;
    }

    const response = isAddingNew
      ? await ipWhitelistService.post(form)
      : await ipWhitelistService.update(updatePayload);

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

    setTableData((prevData: WhitelistRecordRaw[]) => [
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
    setTableData((prevData: WhitelistRecordRaw[]) =>
      prevData.map((item) =>
        item.id === form.id
          ? { ...item, ...form, is_active: Number(form.is_active) }
          : item
      )
    );

    setEditingRow(null);
    setForm(null);
    const page = searchParams.get("page") || "";
    const limit = searchParams.get("limit") || "";
    const newRoute = searchParamsManager.refreshWithCacheBuster({
      page,
      limit,
    });
    route.push(`?${newRoute.toString()}`);
  };

  const handleEditChange = (id: number | null) => {
    if (id === null) {
      setIsAddingNew(false);
    }
    const selectedWhitelistData = whiteListData.find(
      (data: { id: number }) => data.id === id
    );
    setEditingRow(id);
    if (selectedWhitelistData) {
      setForm(selectedWhitelistData);
    }
  };

  const handleAddWhitelistEntry = () => {
    setIsAddingNew(true);
    setForm(null);
    setEditingRow(null);
  };

  const hasInputChanged = () => {
    if (isAddingNew) return true;
    const selectedRecord = tableData.find(
      (record: WhitelistRecordRaw) => record.id === editingRow
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
    if (/^\s+$/.test(value) || !value) {
      setTableData(whiteListData);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const { data } = await ipWhitelistService.find({ searchKey: value });
      setTableData(data);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      <div className="flex justify-start gap-2 2xl:w-1/3 mt-4 w-[40%]">
        <Button
          className="h-8"
          variant="default"
          onClick={handleAddWhitelistEntry}
        >
          New Whitelist Entry
        </Button>
        <SearchInput onSearch={handleSearch} isSearching={isSearching} />
      </div>
      <ScrollArea className="h-[75dvh] mt-4">
        <UserManagementTable
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
    </>
  );
}

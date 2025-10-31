"use client";
import { ChangeEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalToast, toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchQuery } from "@/components/otp-generator/type";
import { useDebouncedCallback } from "use-debounce";
import { DomainManagerClientService } from "@/lib/features/domains/DomainManagerClientService";
import { Pagination } from "@/components/shared/pagination/route-based/Pagination";
import { PaginationProps } from "@/lib/utils/pagination/type/PaginationProps";
import { SearchInput } from "@/components/shared/search/SearchInput";
import { UserAccessTable } from "./UserAccessTable";
import { ApiResponseProps } from "@/database/query";
import { UserAccessDialog } from "../../dialog/UserAccessDialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { UserClientController } from "@/lib/features/users/manage/UserClientController";
import { genderList } from "../../static-data";
import { CryptoClientService } from "@/lib/features/security/cryptography/CryptoClientService";
import { UserPermissionsClientController } from "@/lib/features/users/permissions/UserPermissionsClientController";
import { useUserAccessContext } from "@/context/user-access/UserAccessContext";
import { SelectOptions } from "@/components/shared/select/type";
import { UpdateUserProps } from "@/lib/features/users/manage/type/UserProps";
import { userAccessFormSchema } from "../../schema";
import { ObjectUtils } from "@/lib/utils/object/ObjectUtils";

type Props = {
  response: ApiResponseProps & {
    pagination?: PaginationProps;
  };
  usersData: UserAccessRecordRaw[];
};

export type UserAccessRecordRaw = {
  row_id?: number;
  id: string;
  brand: string[];
  main_menu: string[];
  sub_menu: string[];
  created_at?: string;
  full_name: string;
  display_name: string;
  email: string;
  status: string;
  user_type_name: string;
  team_name: string;
  navMain: any;
};

export type MenuAccess = { mainMenu: string[]; subMenu: string[] };
export type UserAccessFormValues = z.infer<typeof userAccessFormSchema>;

export function UserAccessTableContainer({ response }: Props) {
  const domainsService = new DomainManagerClientService();
  const searchParamsManager = new SearchParamsManager();
  const userClient = new UserClientController();
  const decipher = new CryptoClientService();
  const userPermission = new UserPermissionsClientController();
  const objectUtils = new ObjectUtils();

  const searchParams = useSearchParams();
  const router = useRouter();

  const searchParamCurrentPage = response.pagination?.page;
  const searchParamTotalPages = response.pagination?.total_pages;
  const searchParamLimit = response.pagination?.limit || 50;

  const usersData = response.data as UserAccessRecordRaw[];

  const { brands, menuSelectOptions, userSelectOptions } =
    useUserAccessContext();
  const [editingRow, setEditingRow] = useState("");
  const [dialogState, setDialogState] = useState<{
    userAccess: boolean;
    viewAccess: boolean;
  }>({ userAccess: false, viewAccess: false });
  const [tableData, setTableData] = useState<UserAccessRecordRaw[]>(usersData);
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({
    query: "",
    isSearching: false,
    result: { data: [], isSuccess: false, message: "" },
    selectedResult: null,
  });

  // USER ACCESS
  const userAccessForm = useForm<UserAccessFormValues>({
    resolver: zodResolver(userAccessFormSchema),
    shouldFocusError: true,
    defaultValues: {
      full_name: "",
      display_name: "",
      email: "",
      password: "",
      gender: "",
      user_type: "",
      team: "",
      main_menu: [],
      sub_menu: [],
      brand: [],
    },
    mode: "onChange",
  });

  const [menuAccess, setMenuAccess] = useState<MenuAccess>({
    mainMenu: [],
    subMenu: [],
  });
  const [userAccessFormOriginal, setUserAccessFormOriginal] =
    useState<UserAccessFormValues>({ ...userAccessForm.getValues() });
  const [selectedBrandAccess, setSelectedBrandAccess] = useState<string[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    setTableData(usersData);
  }, [usersData]);

  useEffect(() => {
    if (!dialogState.userAccess && editingRow) {
      setEditingRow("");
    }
  }, [dialogState.userAccess]);

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

  const handleNewEntry = (response: Record<string, any>, formData: any) => {
    const data: {
      id: string;
      password: string;
      created_at: string;
    } = response.data[0];

    const team_name = userSelectOptions.teams.find(
      (t) => t.id == Number(formData.team)
    )?.label;
    const user_type_name = userSelectOptions.user_types.find(
      (ut) => ut.id == Number(formData.user_type)
    )?.label;
    const gender = genderList.find((g) => g.value == formData.gender)?.label;

    const updatedForm = {
      ...formData,
      id: data.id,
      gender,
      password: data.password,
      team_name,
      user_type_name,
      created_at: data.created_at,
      status: "active",
    };

    setTableData((prevData: UserAccessRecordRaw[]) => [
      updatedForm,
      ...prevData,
    ]);

    setIsAddingNew(false);
  };

  const handleUpdateEntry = (formData: Record<string, unknown>) => {
    const team_name = userSelectOptions.teams.find(
      (t) => t.id == Number(formData.team)
    )?.label;
    const user_type_name = userSelectOptions.user_types.find(
      (ut) => ut.id == Number(formData.user_type)
    )?.label;
    const gender = genderList.find((g) => g.value == formData.gender)?.label;
    const cleanUpdateEntry = objectUtils.cleanObjectProperties({
      ...formData,
      gender,
      team_name,
      user_type_name,
    });

    setTableData((prevData: UserAccessRecordRaw[]) =>
      prevData.map((item) =>
        item.id === editingRow ? { ...item, ...cleanUpdateEntry } : item
      )
    );
    setEditingRow("");
  };

  const handleDialogState = (
    dialog: "userAccess" | "viewAccess",
    state: boolean
  ) => {
    setDialogState((prevState) => ({ ...prevState, [dialog]: state }));
  };

  const handleAddUserEntry = () => {
    setIsAddingNew(true);
    // setForm(null);
    // setEditingRow(null);
    handleDialogState("userAccess", true);
  };

  const getChangedValues = () => {
    // 1. Find the original record
    const selectedRecord: UserAccessFormValues = userAccessFormOriginal;

    // If no record is selected (e.g., adding a new user), return all current form values.
    // If you prefer to handle 'isAddingNew' logic here, you can add it back.
    if (!selectedRecord) {
      return userAccessForm.getValues();
    }

    // 2. Get current form values
    const currentFormValues = userAccessForm.getValues();
    const changedValues = {} as Record<string, any>;

    // 3. Define all fields that need comparison
    // Use an array to make adding/removing fields easy
    const fieldsToCompare = [
      "full_name",
      "display_name",
      "email",
      "status",
      "gender",
      "user_type",
      "team",
      "brand",
      "main_menu",
      "sub_menu",
    ];

    for (const fieldName of fieldsToCompare) {
      const originalValue =
        userAccessFormOriginal[fieldName as keyof UserAccessFormValues];
      const currentValue =
        currentFormValues[fieldName as keyof UserAccessFormValues];

      let hasChanged = false;

      // Special handling for Arrays (like brand, main_menu, sub_menu)
      if (Array.isArray(originalValue) && Array.isArray(currentValue)) {
        // Arrays must be compared by their contents.
        // We stringify and sort them to ensure only content changes trigger 'hasChanged'.
        hasChanged =
          JSON.stringify(originalValue.sort()) !==
          JSON.stringify(currentValue.sort());
      } else {
        // Primitive comparison (string, number, boolean)
        hasChanged = originalValue !== currentValue;
      }

      if (hasChanged) {
        // Add the current (updated) value to the payload
        changedValues[fieldName] = currentValue;
      }
    }

    return changedValues;
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

  //USER ACCESS DIALOG
  const handeUserAccessDialogOpenChange = (isOpen: boolean) => {
    handleDialogState("userAccess", isOpen);
  };

  const handleBrandChange = (value: string[]) => {
    setSelectedBrandAccess(value);
  };

  const handleMenuChange = (value: string[], type: "mainMenu" | "subMenu") => {
    setMenuAccess((prevState) => ({ ...prevState, [type]: value }));
  };

  const handleEditChange = async (id: string) => {
    setIsAddingNew(false);
    const selectedUserAccessData = tableData.find(
      (data: { id: string }) => data.id == id
    ) as Record<string, any>;

    setEditingRow(id);
    if (selectedUserAccessData) {
      const {
        row_id,
        assigned_brands,
        brand,
        avatar,
        gender: genderValue,
        password: passwordValue,
        user_type_id,
        team_id,
        navMain,
        team_name,
        user_type_name,
        main_menu: mainMenuValue,
        sub_menu: subMenuValue,
        ...rest
      } = selectedUserAccessData;

      const brands =
        brand ||
        assigned_brands?.map((b: { brand_name: string }) => {
          return String(b.brand_name);
        });

      const main_menu =
        mainMenuValue || navMain.map((nav: { id: number }) => String(nav.id));
      const sub_menu =
        subMenuValue ||
        navMain.flatMap((menuItem: { items: Record<string, any>[] }) =>
          menuItem.items.map((subItem) => subItem.id.toString())
        );

      handleBrandChange(brands);
      handleMenuChange(main_menu, "mainMenu");
      handleMenuChange(sub_menu, "subMenu");

      const gender = genderValue == "Male" ? "1" : "2";
      const user_type = String(user_type_id);
      const team = String(team_id);
      const { decryptedData } = await decipher.decrypt({ data: passwordValue });

      const userAccessEdit = {
        gender,
        main_menu,
        sub_menu,
        team,
        user_type,
        password: decryptedData,
        ...rest,
      };

      // store an original copy
      const formOriginal = {
        brand: brands, // use the ["Brand"] not the [id]
        gender,
        main_menu,
        sub_menu,
        team,
        user_type,
        ...rest,
      };

      setUserAccessFormOriginal({
        ...formOriginal,
        password: passwordValue,
      } as UserAccessFormValues);

      Object.entries(userAccessEdit).forEach(([key, value]) => {
        userAccessForm.setValue(key as any, value);
      });
      handleDialogState("userAccess", true);
    }
  };

  //transfer this in Object Utils if reusable
  const handleSubmit = async (formPayload: UserAccessFormValues) => {
    const changedValues = getChangedValues();

    const { brand, main_menu, sub_menu, gender, team, user_type, ...rest } =
      changedValues;
    const requestPayload: any = {
      ...rest,
      gender_type_id: Number(gender),
      user_type_id: Number(user_type),
      team_id: Number(team),
    };
    const cleanedRequestPayload: Record<string, unknown> =
      objectUtils.cleanObjectProperties(requestPayload);

    let userInfoResponse: ApiResponseProps = {
      data: [],
      isSuccess: true,
      message: "",
    };
    if (isAddingNew) {
      const postPayload = {
        ...requestPayload,
        gender_type_id: Number(formPayload.gender),
        user_type_id: Number(formPayload.user_type),
        team_id: Number(formPayload.team),
        password: formPayload.password,
      };
      userInfoResponse = await userClient.post(postPayload);
    } else if (!isAddingNew) {
      const updatePayload = {
        id: editingRow,
        ...cleanedRequestPayload,
      } as UpdateUserProps;
      const updatePayloadKeys = Object.keys(updatePayload);
      const isIdOnlyInObject =
        updatePayloadKeys.length === 1 && updatePayloadKeys[0] === "id";

      if (!isIdOnlyInObject) {
        userInfoResponse = await userClient.update(updatePayload);
      }
    }

    if (!userInfoResponse.isSuccess) {
      showToast(false, userInfoResponse.message);
      return;
    }

    //if user is newly added get the encrypted id from response
    const userId = isAddingNew ? userInfoResponse.data[0].id : editingRow;

    if ("main_menu" in changedValues || "sub_menu" in changedValues) {
      //format the main menu param
      const menuParam = menuAccess.mainMenu.map((mainMenuId) => {
        const subMenu =
          menuSelectOptions.sub_menu
            .filter((sm) => sm.main_menu_id == mainMenuId)
            .map((fsm) => ({ sub_menu_id: fsm.id })) || undefined;
        return {
          main_menu_id: Number(mainMenuId),
          sub_menu: subMenu,
        };
      });

      const menuPermissionResponse =
        await userPermission.postUserMenuPermissions({
          main_menu: menuParam,
          user_id: [userId],
        });

      if (!menuPermissionResponse.isSuccess) {
        showToast(false, menuPermissionResponse.message);
      }
    }

    if ("brand" in changedValues) {
      const brand_id = brand.map((brandName: string) => {
        const brandId = brands.find(
          (brandOption: SelectOptions) => brandOption.label == brandName
        )?.id;
        return brandId;
      });
      const brandPermissionResponse =
        await userPermission.postUserBrandPermissions({
          brand_id,
          user_id: [userId],
        });

      if (!brandPermissionResponse.isSuccess) {
        showToast(false, brandPermissionResponse.message);
      }
    }

    setDialogState((prevState) => ({ ...prevState, userAccess: false }));
    const entryData = {
      ...rest,
      brand,
      gender,
      main_menu,
      sub_menu,
      user_type,
      team,
    };
    if (isAddingNew) {
      handleNewEntry(userInfoResponse, entryData);
    } else {
      const cleanUpdateEntry = objectUtils.cleanObjectProperties(entryData);
      handleUpdateEntry(cleanUpdateEntry);
    }

    userAccessForm.reset();
    setMenuAccess({ mainMenu: [], subMenu: [] });
    setSelectedBrandAccess([]);
    setUserAccessFormOriginal({ ...userAccessForm.getValues() });
  };

  return (
    <>
      <UserAccessDialog
        isAddingNew={isAddingNew}
        isActionDisabled={false}
        open={dialogState.userAccess}
        onBrandChange={handleBrandChange}
        onMenuChange={handleMenuChange}
        onOpenChange={handeUserAccessDialogOpenChange}
        onSubmit={handleSubmit}
        selectedBrandAccess={selectedBrandAccess}
        selectedMenuAccess={menuAccess}
        userAccessForm={userAccessForm}
      />
      <div className="flex justify-start gap-2 mt-4 w-full">
        <Button
          className="cursor-pointer h-9"
          variant="default"
          onClick={handleAddUserEntry}
        >
          New User Entry
        </Button>
        <div className="relative w-[30%]">
          <SearchInput
            className="h-9"
            searchQuery={searchQuery}
            onSearchFocus={handleSearchFocus}
            onSearchQueryChange={handleSearchQueryChange}
            placeholder="Search a user"
          />
        </div>
      </div>
      <ScrollArea className="h-[70dvh] mt-4">
        <UserAccessTable
          data={tableData}
          editingRow={editingRow}
          handleEditChange={handleEditChange}
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

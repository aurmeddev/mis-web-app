import { useState, useEffect, useMemo, ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDebouncedCallback } from "use-debounce";
import { ApiResponseProps } from "@/database/poolQuery";
import { userAccessFormSchema } from "../../schema";
import { SelectOptions } from "@/components/shared/select/type";
import { useUserAccessContext } from "@/context/user-access/UserAccessContext";
import { DomainManagerClientService } from "@/lib/features/domains/DomainManagerClientService";
import { CryptoClientService } from "@/lib/features/security/cryptography/CryptoClientService";
import { UpdateUserProps } from "@/lib/features/users/manage/type/UserProps";
import { UserClientController } from "@/lib/features/users/manage/UserClientController";
import { UserPermissionsClientController } from "@/lib/features/users/permissions/UserPermissionsClientController";
import { ObjectUtils } from "@/lib/utils/object/ObjectUtils";
import { SearchParamsManager } from "@/lib/utils/search-params/SearchParamsManager";
import { showToast } from "@/lib/utils/toast";
import { genderList } from "../../static-data";
import {
  MenuAccess,
  UserAccessFormValues,
  UserAccessRecordRaw,
  UseUserAccessProps,
} from "../UserAccess.types";
import { ArrayUtils } from "@/lib/utils/array/ArrayUtils";

export const useUserAccess = ({ response }: UseUserAccessProps) => {
  // --- Service Initialization ---
  const domainsService = new DomainManagerClientService();
  const searchParamsManager = new SearchParamsManager();
  const userClient = new UserClientController();
  const decipher = new CryptoClientService();
  const userPermission = new UserPermissionsClientController();
  const objectUtils = new ObjectUtils();
  const arrayUtils = new ArrayUtils();

  // --- Context/Router Hooks ---
  const searchParams = useSearchParams();
  const router = useRouter();
  const { brands, menuSelectOptions, userSelectOptions } =
    useUserAccessContext();

  const menuStructure = menuSelectOptions.main_menu
    .map((mainMenu) => {
      const mainMenuId = String(mainMenu.id);
      const subMenu =
        menuSelectOptions.sub_menu
          .filter((sm) => sm.main_menu_id == mainMenuId)
          .map((fsm) => ({
            sub_menu_id: String(fsm.id),
            label: fsm.label,
            sort: fsm.sort,
          }))
          .sort((a, b) => a.sort - b.sort) || undefined;
      return {
        main_menu_id: mainMenuId,
        label: mainMenu.label,
        sub_menu: subMenu,
        sort: mainMenu.sort,
      };
    })
    .sort((a, b) => a.sort - b.sort);

  // --- State Management ---
  const usersData = response.data as UserAccessRecordRaw[];
  const [editingRow, setEditingRow] = useState("");
  const [dialogState, setDialogState] = useState({
    userAccess: false,
    viewAccess: false,
  });
  const [tableData, setTableData] = useState<UserAccessRecordRaw[]>(usersData);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [searchQuery, setSearchQuery] = useState({
    query: "",
    isSearching: false,
    result: { data: [], isSuccess: false, message: "" },
    selectedResult: null,
  });

  const [menuAccess, setMenuAccess] = useState<MenuAccess>({
    mainMenu: [],
    subMenu: [],
  });

  // --- Form Hook ---
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

  const [userAccessFormOriginal, setUserAccessFormOriginal] =
    useState<UserAccessFormValues>({ ...userAccessForm.getValues() });
  const [selectedBrandAccess, setSelectedBrandAccess] = useState<string[]>([]);

  // Variables
  let brandValue: string[] = [];

  // --- Effects ---
  useEffect(() => {
    setTableData(usersData);
  }, [usersData]);

  useEffect(() => {
    if (!dialogState.userAccess && editingRow) {
      setEditingRow("");
    }
  }, [dialogState.userAccess]);

  // --- Utility Functions ---
  const handleDialogState = (
    dialog: "userAccess" | "viewAccess",
    state: boolean
  ) => {
    setDialogState((prevState) => ({ ...prevState, [dialog]: state }));
  };

  const handeUserAccessDialogOpenChange = (isOpen: boolean) => {
    handleDialogState("userAccess", isOpen);
  };

  // --- Data Manipulation Functions ---

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

  const getChangedValues = () => {
    const selectedRecord: UserAccessFormValues = userAccessFormOriginal;

    // If no record is selected (adding a new user), return all current form values.
    if (!selectedRecord || isAddingNew) {
      return userAccessForm.getValues();
    }

    const currentFormValues = userAccessForm.getValues();
    const changedValues = {} as Record<string, any>;
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

      // Special handling for Arrays
      if (Array.isArray(originalValue) && Array.isArray(currentValue)) {
        hasChanged =
          JSON.stringify(originalValue.sort()) !==
          JSON.stringify(currentValue.sort());

        if (hasChanged) {
          const removedValue = arrayUtils.getUniqueMerged(
            originalValue,
            currentValue
          );
          changedValues[fieldName] = removedValue;
          brandValue = currentValue;
          continue;
        }
      } else {
        hasChanged = originalValue !== currentValue;
      }

      if (hasChanged) {
        changedValues[fieldName] = currentValue;
      }
    }

    return changedValues;
  };

  // --- Handlers for User Access Dialog ---
  const handleBrandChange = (value: string[]) => {
    setSelectedBrandAccess(value);
  };

  const handleMenuChange = (value: string[], type: "mainMenu" | "subMenu") => {
    setMenuAccess((prevState) => ({ ...prevState, [type]: value }));
  };

  const handleAddUserEntry = () => {
    handleReset();
    setIsAddingNew(true);
    handleDialogState("userAccess", true);
  };

  const handleEditChange = async (id: string) => {
    setIsAddingNew(false);
    const selectedUserAccessData = tableData.find(
      (data) => data.id === id
    ) as Record<string, any>;
    setEditingRow(id);

    if (selectedUserAccessData) {
      const {
        brand,
        assigned_brands,
        gender: genderValue,
        password: passwordValue,
        user_type_id,
        team_id,
        navMain,
        main_menu: mainMenuValue,
        sub_menu: subMenuValue,
        ...rest
      } = selectedUserAccessData;

      const brandsAccess =
        brand ||
        assigned_brands?.map((b: { brand_name: string }) =>
          String(b.brand_name)
        );
      const main_menu =
        mainMenuValue || navMain.map((nav: { id: number }) => String(nav.id));
      const sub_menu =
        subMenuValue ||
        navMain.flatMap((menuItem: { items: Record<string, any>[] }) =>
          menuItem.items.map((subItem) => subItem.id.toString())
        );

      handleBrandChange(brandsAccess);
      handleMenuChange(main_menu, "mainMenu");
      handleMenuChange(sub_menu, "subMenu");

      const gender = genderValue === "Male" ? "1" : "2";
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

      const formOriginal = {
        // Storing original copy for comparison
        brand: brandsAccess,
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

  const handleReset = () => {
    userAccessForm.reset();
    setMenuAccess({ mainMenu: [], subMenu: [] });
    setSelectedBrandAccess([]);
  };

  // --- Main Submit Handler ---

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
    } else if (userInfoResponse.message) {
      showToast(true, userInfoResponse.message);
    }

    //if user is newly added get the encrypted id from response
    const userId = isAddingNew ? userInfoResponse.data[0].id : editingRow;

    if ("main_menu" in changedValues || "sub_menu" in changedValues) {
      //format the main menu param
      const menuParam = menuAccess.mainMenu.map((mainMenuId) => {
        const subMenu =
          menuSelectOptions.sub_menu
            .filter(
              (sm) =>
                sm.main_menu_id == mainMenuId &&
                menuAccess.subMenu.includes(sm.value)
            )
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

      showToast(
        menuPermissionResponse.isSuccess,
        menuPermissionResponse.message
      );
    }

    if ("brand" in changedValues) {
      const brand_id = brand.map((brandName: string) => {
        const brandId = brands.find(
          (brandOption: SelectOptions) => brandOption.label == brandName
        )?.id;
        return brandId;
      });
      const brandPermissionResponse = isAddingNew
        ? await userPermission.postUserBrandPermissions({
            brand_id,
            user_id: [userId],
          })
        : await userPermission.updateUserBrandPermissions({
            brand_id,
            user_id: [userId],
          });

      showToast(
        brandPermissionResponse.isSuccess,
        brandPermissionResponse.message
      );
    }

    setDialogState((prevState) => ({ ...prevState, userAccess: false }));
    const brandData = brandValue.length > 0 ? brandValue : brand;
    const entryData = {
      ...rest,
      brand: brandData,
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

    handleReset();
    setUserAccessFormOriginal({ ...userAccessForm.getValues() });
  };

  // --- Handlers for Search and Pagination ---

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
    if (response.pagination?.limit !== limit) {
      urlQuery.set("page", "1");
    }
    router.push(`?${urlQuery.toString()}`);
  };

  // --- Derived Props for Pagination ---
  const searchParamCurrentPage = response.pagination?.page;
  const searchParamTotalPages = response.pagination?.total_pages;
  const searchParamLimit = response.pagination?.limit || 50;

  return {
    // State
    dialogState,
    editingRow,
    isAddingNew,
    tableData,
    searchQuery,
    menuAccess,
    selectedBrandAccess,
    userAccessForm,

    // Data
    menuStructure,

    // Pagination Props
    searchParamCurrentPage,
    searchParamTotalPages,
    searchParamLimit,

    // Handlers
    handleAddUserEntry,
    handleEditChange,
    handleSubmit,
    handleBrandChange,
    handleMenuChange,
    handeUserAccessDialogOpenChange,
    handlePagination,
    handleSearchQueryChange,
    handleSearchFocus,
  };
};

"use-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FieldPath, UseFormReturn } from "react-hook-form";
import { StepProgress } from "@/components/shared/step-progress/StepProgress";
import { MultiSelectComboBoxV2 } from "@/components/shared/select/MultiSelectComboBoxV2";
import {
  MenuAccess,
  UserAccessFormValues,
} from "../user-access/table/UserAccessTableContainer";
import { useUserAccessContext } from "@/context/user-access/UserAccessContext";
import { RHFInput } from "@/components/shared/rhf/RHFInput";
import { RHFSelect } from "@/components/shared/rhf/RHFSingleSelect";
import { RHFPasswordToggleInput } from "@/components/shared/rhf/RHFPasswordToggleInput";
import { Label } from "@/components/ui/label";
import { CheckedState } from "@radix-ui/react-checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MenuAccessItem } from "../menu-access/MenuAccessItem";

type SubMenu = {
  sub_menu_id: string;
  label: string;
};

type ParentMenu = {
  main_menu_id: string;
  label: string;
  sub_menu: SubMenu[];
  sort: number;
};

type Props = {
  isAddingNew: boolean;
  isActionDisabled: boolean;
  onBrandChange: (value: string[]) => void;
  onMenuChange: (value: string[], type: "mainMenu" | "subMenu") => void;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: UserAccessFormValues) => void;
  selectedBrandAccess: string[];
  selectedMenuAccess: MenuAccess;
  open: boolean;
  userAccessForm: UseFormReturn<
    UserAccessFormValues,
    any,
    UserAccessFormValues
  >;
};

const TOTAL_STEPS = 3;

export function UserAccessDialog({
  isAddingNew,
  isActionDisabled,
  onBrandChange,
  onMenuChange,
  onOpenChange,
  onSubmit,
  selectedBrandAccess,
  selectedMenuAccess,
  open,
  userAccessForm,
}: Props) {
  const { brands, menuSelectOptions, userSelectOptions } =
    useUserAccessContext();
  const [step, setStep] = useState(1);
  const {
    control,
    formState,
    getValues,
    setValue,
    handleSubmit,
    reset,
    trigger,
    watch,
  } = userAccessForm;

  const handleClose = () => {
    setStep(1);
    onBrandChange([]);
    onMenuChange([], "mainMenu");
    onMenuChange([], "subMenu");
    reset();
  };

  const menuStructure: ParentMenu[] = useMemo(
    () =>
      menuSelectOptions.main_menu
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
        .sort((a, b) => a.sort - b.sort),
    [menuSelectOptions]
  );

  // Pre-compute a map for O(1) lookup of main menu items
  const mainMenuMap = new Map(
    menuSelectOptions.main_menu.map((item) => [item.value, item])
  );

  const selectedMenuStructure = useMemo(() => {
    return selectedMenuAccess.mainMenu
      .map((mainMenuId) => {
        const mainMenu = mainMenuMap.get(mainMenuId);

        // Skip if main menu item doesn't exist
        if (!mainMenu) return null;

        // Filter Sub Menus efficiently
        const filteredSubMenu = menuSelectOptions.sub_menu
          .filter(
            (sm) =>
              sm.main_menu_id === mainMenuId &&
              selectedMenuAccess.subMenu.includes(sm.value)
          )
          .map((fsm) => ({ label: fsm.label, sort: fsm.sort }));

        return {
          label: mainMenu.label,
          sub_menu: filteredSubMenu,
          sort: Number(mainMenu.sort) || 1,
        };
      })
      .filter((item) => item !== null)
      .sort((a, b) => a.sort - b.sort);
  }, [
    selectedMenuAccess.mainMenu,
    selectedMenuAccess.subMenu,
    menuSelectOptions.sub_menu,
    mainMenuMap,
  ]);

  const nameDetails = {
    full_name: getValues("full_name"),
    display_name: getValues("display_name"),
  };
  const email = getValues("email");

  const silentOptions = {
    shouldValidate: false,
    shouldDirty: false,
    shouldTouch: false,
  };

  // Function to handle changes for Main Menu Checkboxes
  const handleParentChange = (checked: CheckedState, main_menu_id: string) => {
    const currentMainMenus = getValues("main_menu") || [];
    const currentSubMenus = getValues("sub_menu") || [];

    let newMainMenus = [];
    if (checked) {
      // Add the main menu ID
      newMainMenus = [...currentMainMenus, main_menu_id];
      setValue("main_menu", newMainMenus, silentOptions);
    } else {
      // Remove the main menu ID
      newMainMenus = currentMainMenus.filter((id) => id !== main_menu_id);
      setValue("main_menu", newMainMenus, silentOptions);
    }
    onMenuChange(newMainMenus, "mainMenu");

    const childrenSubMenuIds =
      menuStructure
        .find((p) => p.main_menu_id === main_menu_id)
        ?.sub_menu.map((c) => c.sub_menu_id) || [];

    let newSubMenus = [];
    if (checked) {
      const subMenusToAdd = childrenSubMenuIds.filter(
        (id) => !currentSubMenus.includes(id)
      );
      newSubMenus = [...currentSubMenus, ...subMenusToAdd];
      setValue("sub_menu", newSubMenus, silentOptions);
    } else {
      newSubMenus = currentSubMenus.filter(
        (id) => !childrenSubMenuIds.includes(id)
      );
      setValue("sub_menu", newSubMenus, silentOptions);
    }
    onMenuChange(newSubMenus, "subMenu");
  };

  // Function to handle changes for Sub Menu Checkboxes
  const handleChildChange = (checked: CheckedState, sub_menu_id: string) => {
    const currentMainMenus = getValues("main_menu") || [];
    const currentSubMenus = getValues("sub_menu") || [];

    const mainMenuId = menuSelectOptions.sub_menu.find(
      (sm) => sm.id == Number(sub_menu_id)
    )?.main_menu_id;

    let newSubMenus = [];
    let newMainMenus: string[] = [];
    if (checked) {
      // Add the sub menu ID
      newSubMenus = [...currentSubMenus, sub_menu_id];
      // Check also the main menu of sub
      newMainMenus = [...currentMainMenus, String(mainMenuId)];
      setValue("main_menu", newMainMenus, silentOptions);
      setValue("sub_menu", newSubMenus, silentOptions);
    } else {
      // Remove the sub menu ID
      newSubMenus = currentSubMenus.filter((id) => id !== sub_menu_id);
      // Check if any of the sub menu of a menu is checked
      const filteredSubMenu = menuSelectOptions.sub_menu
        .filter((sm) => sm.main_menu_id == mainMenuId)
        .map((fsm) => fsm.value);
      const isAnySubMenusChecked = newSubMenus.some((nsm) =>
        filteredSubMenu.includes(nsm)
      );

      if (!isAnySubMenusChecked) {
        newMainMenus = currentMainMenus.filter(
          (id) => id !== String(mainMenuId)
        );
        setValue("main_menu", newMainMenus, silentOptions);
      }
      setValue("sub_menu", newSubMenus, silentOptions);
    }
    onMenuChange(newMainMenus, "mainMenu");
    onMenuChange(newSubMenus, "subMenu");
  };

  const handleStep = async (type: "back" | "next") => {
    const stepForm: FieldPath<UserAccessFormValues>[][] = [
      [
        "full_name",
        "display_name",
        "email",
        "password",
        "gender",
        "user_type",
        "team",
      ],
      ["brand", "main_menu", "sub_menu"],
    ];
    const isFormValid = await trigger(stepForm[step - 1]);
    if (isFormValid) {
      setStep((prev) => (type == "back" ? prev - 1 : prev + 1));
    }
  };

  // Watch the fields to trigger re-renders when the arrays change
  const watchedMainMenus = watch("main_menu") || [];
  const watchedSubMenus = watch("sub_menu") || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onEscapeKeyDown={(ev) => ev.preventDefault()}
        onCloseAutoFocus={handleClose}
        onInteractOutside={(ev) => ev.preventDefault()}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>{isAddingNew ? "New" : "Update"} User Entry</DialogTitle>
          <DialogDescription>
            Configure permissions and assign access.
          </DialogDescription>
          <div className="flex justify-between pt-2 relative w-full">
            <StepProgress
              steps={["User Info", "Add Permissions", "Review and Confirm"]}
              currentStep={step}
            />
          </div>
          <DialogClose
            disabled={isActionDisabled || formState.isSubmitting}
            className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>

        <Form {...userAccessForm}>
          <form
            autoComplete="off"
            onSubmit={handleSubmit(onSubmit)}
            className="w-full space-y-6"
          >
            {step == 1 && (
              <>
                <RHFInput
                  control={control}
                  name="full_name"
                  label="Full Name"
                  placeholder="input"
                />
                <RHFInput
                  control={control}
                  name="display_name"
                  label="Display Name"
                  placeholder="input"
                  isOptional
                />

                <RHFInput
                  control={control}
                  name="email"
                  label="Email"
                  placeholder="your.email@example.com"
                  type="email"
                />

                <RHFPasswordToggleInput
                  control={control}
                  name="password"
                  label="Password"
                  placeholder="input"
                />

                <FormField
                  control={control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <RadioGroup
                          className="flex space-y-1"
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem id="male" value="1" />
                            <Label htmlFor="male">Male</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem id="female" value="2" />
                            <Label htmlFor="female">Female</Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <RHFSelect
                  control={control}
                  name="user_type"
                  label="Account Type"
                  placeholder="Select account type"
                  options={userSelectOptions.user_types}
                />

                <RHFSelect
                  control={control}
                  name="team"
                  label="Team"
                  placeholder="Select team"
                  options={userSelectOptions.teams}
                />
              </>
            )}

            {step == 2 && (
              <>
                <FormField
                  control={control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <FormControl>
                        <MultiSelectComboBoxV2
                          label="Select brand"
                          options={brands}
                          onSelectValue={(value) => {
                            onBrandChange(value);
                            field.onChange(value);
                          }}
                          selectedValue={selectedBrandAccess}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="main_menu"
                  render={() => (
                    <FormItem>
                      <FormLabel>Menus</FormLabel>
                      <FormControl>
                        <div>
                          {menuStructure.map((parent) => (
                            <MenuAccessItem
                              key={parent.main_menu_id}
                              parent={parent}
                              watchedMainMenus={watchedMainMenus}
                              watchedSubMenus={watchedSubMenus}
                              handleParentChange={handleParentChange}
                              handleChildChange={handleChildChange}
                            />
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {step == 3 && (
              <div className="grid gap-4 px-1 text-sm">
                <div>
                  <div className="text-muted-foreground">Name</div>
                  <div>{nameDetails.full_name}</div>
                  <div className="text-muted-foreground">
                    {nameDetails.display_name}
                  </div>
                </div>

                <div>
                  <div className="text-muted-foreground">Email</div>
                  <div>{email}</div>
                </div>

                <div>
                  <div className="text-muted-foreground">Brand Access</div>
                  {selectedBrandAccess.length > 0 ? (
                    selectedBrandAccess.map((selBrandAccess) => {
                      const brandLabel = brands.find(
                        (b: { value: string }) => b.value == selBrandAccess
                      )?.label;
                      return <div key={brandLabel}>{brandLabel}</div>;
                    })
                  ) : (
                    <div>None</div>
                  )}
                </div>

                <div>
                  <div className="text-muted-foreground">Menu Access</div>
                  {selectedMenuStructure.map((selMenuAccess) => (
                    <div key={selMenuAccess.label} className="mb-2 space-y-1">
                      {selMenuAccess.label}
                      {selMenuAccess.sub_menu.map((selSubAccess) => (
                        <div key={selSubAccess.label} className="ml-2">
                          - {selSubAccess.label}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              {step > 1 && (
                <Button
                  className={cn("cursor-pointer")}
                  disabled={isActionDisabled || formState.isSubmitting}
                  onClick={() => handleStep("back")}
                  type="button"
                  variant={"outline"}
                >
                  Back
                </Button>
              )}

              {step < TOTAL_STEPS && (
                <Button
                  className={cn("cursor-pointer")}
                  disabled={isActionDisabled}
                  onClick={() => handleStep("next")}
                  type="button"
                >
                  Next
                </Button>
              )}

              {step == TOTAL_STEPS && (
                <Button
                  className={cn("cursor-pointer")}
                  disabled={isActionDisabled || formState.isSubmitting}
                  type="submit"
                >
                  {formState.isSubmitting ? "Saving..." : "Save"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

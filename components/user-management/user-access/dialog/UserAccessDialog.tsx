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
import React, { ReactNode, useMemo, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Form } from "@/components/ui/form";
import { FieldPath, UseFormReturn } from "react-hook-form";
import { StepProgress } from "@/components/shared/step-progress/StepProgress";
import { useUserAccessContext } from "@/context/user-access/UserAccessContext";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Step1Fields } from "./step/Step1Fields";
import { Step2Fields } from "./step/Step2Fields";
import { Step3Review } from "./step/Step3Review";
import {
  MenuAccess,
  UserAccessEditType,
  UserAccessFormValues,
} from "../UserAccess.types";

type SubMenu = {
  sub_menu_id: string;
  label: string;
};

export type ParentMenu = {
  main_menu_id: string;
  label: string;
  sub_menu: SubMenu[];
  sort: number;
};

type Props = {
  editType: UserAccessEditType;
  isAddingNew: boolean;
  isActionDisabled: boolean;
  menuStructure: ParentMenu[];
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
  editType,
  isAddingNew,
  isActionDisabled,
  menuStructure,
  onBrandChange,
  onMenuChange,
  onOpenChange,
  onSubmit,
  selectedBrandAccess,
  selectedMenuAccess,
  open,
  userAccessForm,
}: Props) {
  console.log("editType ", editType);
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

  // Pre-compute a map for O(1) lookup of main menu items
  const mainMenuMap = new Map(
    menuSelectOptions.main_menu.map((item) => [item.value, item])
  );

  const selectedMenuStructure = selectedMenuAccess.mainMenu
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

  // handle changes for Sub Menu Checkboxes
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
      const mergeMainMenus = [...currentMainMenus, String(mainMenuId)];
      newMainMenus = [...new Set(mergeMainMenus)];

      setValue("main_menu", newMainMenus, silentOptions);
      setValue("sub_menu", newSubMenus, silentOptions);
    } else {
      //retain the main menus
      newMainMenus = currentMainMenus;
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

  const stepsItems = ["User Info", "Add Permissions", "Review and Confirm"];
  const currentStepItem = {
    info: [stepsItems[0], stepsItems[2]],
    permission: [stepsItems[1], stepsItems[2]],
    all: stepsItems,
  };

  const eventPreventDefault = (ev: Event) => ev.preventDefault();

  // Watch the fields to trigger re-renders when the arrays change
  const watchedMainMenus = watch("main_menu") || [];
  const watchedSubMenus = watch("sub_menu") || [];

  const flowComponents = {
    info: [Step1Fields, Step3Review],
    permission: [Step2Fields, Step3Review],
    all: [Step1Fields, Step2Fields, Step3Review],
  };

  // 'editType' ('all', 'info', or 'permission')
  const componentsToRender = flowComponents[editType] || [];
  const CurrentComponent = componentsToRender[step - 1];

  // Function to render the component fields and props
  const renderComponent = (
    Component:
      | typeof Step1Fields
      | typeof Step2Fields
      | typeof Step3Review
      | null
  ) => {
    if (!Component) return null;

    switch (Component) {
      case Step1Fields:
        return (
          <Step1Fields
            control={control}
            userSelectOptions={userSelectOptions}
          />
        );
      case Step2Fields:
        return (
          <Step2Fields
            brands={brands}
            control={control}
            menuStructure={menuStructure}
            onBrandChange={onBrandChange}
            onParentChange={handleParentChange}
            onChildChange={handleChildChange}
            selectedBrandAccess={selectedBrandAccess}
            watchedMainMenus={watchedMainMenus}
            watchedSubMenus={watchedSubMenus}
          />
        );
      case Step3Review:
        return (
          <Step3Review
            brands={brands}
            selectedBrandAccess={selectedBrandAccess}
            selectedMenuStructure={selectedMenuStructure}
            watchedDetails={{
              display_name: nameDetails.display_name,
              email,
              full_name: nameDetails.full_name,
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onEscapeKeyDown={eventPreventDefault}
        onCloseAutoFocus={handleClose}
        onInteractOutside={eventPreventDefault}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>{isAddingNew ? "New" : "Update"} User Entry</DialogTitle>
          <DialogDescription>
            Configure permissions and assign access.
          </DialogDescription>
          <div className="flex justify-between pt-2 relative w-full">
            <StepProgress
              steps={currentStepItem[editType]}
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
            {renderComponent(CurrentComponent)}
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

              {step < flowComponents[editType].length && (
                <Button
                  className={cn("cursor-pointer")}
                  disabled={isActionDisabled}
                  onClick={() => handleStep("next")}
                  type="button"
                >
                  Next
                </Button>
              )}

              {step === flowComponents[editType].length && (
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
